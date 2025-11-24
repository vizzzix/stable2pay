import { ethers } from 'ethers';
import { store } from './store.js';
import { WSMessage } from './types.js';

const RPC_URL = process.env.RPC_URL || 'https://rpc.testnet.stable.xyz';

// Callback for notifying WebSocket clients
type PaymentCallback = (message: WSMessage) => void;

class BlockchainListener {
  private provider: ethers.JsonRpcProvider;
  private isListening = false;
  private lastProcessedBlock = 0;
  private onPayment: PaymentCallback | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
  }

  setPaymentCallback(callback: PaymentCallback): void {
    this.onPayment = callback;
  }

  async start(): Promise<void> {
    if (this.isListening) return;
    this.isListening = true;

    console.log('🔗 Connecting to Stable Testnet...');

    try {
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to chain ${network.chainId}`);

      this.lastProcessedBlock = await this.provider.getBlockNumber();
      console.log(`📦 Starting from block ${this.lastProcessedBlock}`);

      // Poll for new blocks every 1 second
      this.pollBlocks();
    } catch (error) {
      console.error('❌ Failed to connect to blockchain:', error);
      this.isListening = false;

      // Retry after 5 seconds
      setTimeout(() => this.start(), 5000);
    }
  }

  private async pollBlocks(): Promise<void> {
    while (this.isListening) {
      try {
        const currentBlock = await this.provider.getBlockNumber();

        if (currentBlock > this.lastProcessedBlock) {
          // Process all new blocks
          for (let blockNum = this.lastProcessedBlock + 1; blockNum <= currentBlock; blockNum++) {
            await this.processBlock(blockNum);
          }
          this.lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        console.error('Error polling blocks:', error);
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async processBlock(blockNumber: number): Promise<void> {
    try {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block || !block.prefetchedTransactions) return;

      for (const tx of block.prefetchedTransactions) {
        await this.processTransaction(tx);
      }
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
    }
  }

  private async processTransaction(tx: ethers.TransactionResponse): Promise<void> {
    // Skip contract deployments or transactions without value
    if (!tx.to || tx.value === 0n) return;

    const toAddress = tx.to.toLowerCase();
    const value = tx.value.toString();

    // Check if this payment matches any pending invoice
    const invoice = store.findMatchingInvoice(toAddress, value);

    if (invoice) {
      console.log(`💰 Payment detected for invoice ${invoice.orderId}`);
      console.log(`   TX: ${tx.hash}`);
      console.log(`   Amount: ${ethers.formatUnits(value, 18)} gUSDT`);

      // Update invoice status
      store.update(invoice.id, {
        status: 'PAID',
        txHash: tx.hash,
      });

      // Notify WebSocket clients
      if (this.onPayment) {
        this.onPayment({
          type: 'PAID',
          orderId: invoice.orderId,
          txHash: tx.hash,
        });
      }
    }
  }

  stop(): void {
    this.isListening = false;
    console.log('🛑 Blockchain listener stopped');
  }
}

export const blockchain = new BlockchainListener();
