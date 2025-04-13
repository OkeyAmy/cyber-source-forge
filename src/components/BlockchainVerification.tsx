import React, { useState } from 'react';
import { Shield, ExternalLink, Info } from 'lucide-react';
import { BlockchainVerification as BlockchainVerificationType } from '@/types/chatTypes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BlockchainVerificationProps {
  verification: BlockchainVerificationType;
  showDetails?: boolean;
  className?: string;
}

export function BlockchainVerification({
  verification,
  showDetails = false,
  className = ''
}: BlockchainVerificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Truncate hash for display
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };
  
  // Get blockchain explorer URL
  const getExplorerUrl = (network: string, txId?: string) => {
    if (!txId) return '';
    
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txId}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txId}`;
      case 'solana':
        return `https://explorer.solana.com/tx/${txId}`;
      default:
        return `https://blockscan.com/tx/${txId}`;
    }
  };
  
  // Get IPFS gateway URL
  const getIpfsUrl = (ipfsHash?: string) => {
    if (!ipfsHash) return '';
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  };

  const statusColor = getStatusColor(verification.status);
  const explorerUrl = getExplorerUrl(verification.network, verification.transactionId);
  const ipfsUrl = getIpfsUrl(verification.ipfsHash);

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center px-2 py-1 rounded-full border ${statusColor} text-xs font-medium ${className}`}>
              <Shield size={12} className="mr-1" />
              <span>{verification.status === 'verified' ? 'Verified' : verification.status === 'pending' ? 'Pending' : 'Failed'}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="bg-cyber-dark border border-cyber-green/20 p-3 max-w-xs z-50">
            <div className="space-y-2 text-xs">
              <p className="font-medium">Blockchain Verification</p>
              <p><span className="text-white/60">Status:</span> {verification.status}</p>
              <p><span className="text-white/60">Network:</span> {verification.network}</p>
              <p><span className="text-white/60">Time:</span> {formatTimestamp(verification.timestamp)}</p>
              <p className="font-mono"><span className="text-white/60">Hash:</span> {truncateHash(verification.hash)}</p>
              {verification.transactionId && (
                <p><span className="text-white/60">Transaction:</span> {truncateHash(verification.transactionId)}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`bg-cyber-dark/60 border ${statusColor} rounded-xl p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield size={16} className="mr-2" />
          <span className="text-sm font-medium">
            {verification.status === 'verified' ? 'Verified on Blockchain' : verification.status === 'pending' ? 'Verification Pending' : 'Verification Failed'}
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-white/60 hover:text-white"
          aria-label={isExpanded ? "Show less" : "Show more"}
        >
          <Info size={14} />
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
          <p className="flex justify-between">
            <span className="text-white/60">Network:</span> 
            <span>{verification.network}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-white/60">Timestamp:</span> 
            <span>{formatTimestamp(verification.timestamp)}</span>
          </p>
          <p className="">
            <span className="text-white/60">Hash:</span> 
            <span className="break-all block mt-1">{verification.hash}</span>
          </p>
          
          {verification.transactionId && (
            <div className="pt-2">
              <p className="flex items-center text-white/60">Transaction:</p>
              <p className="break-all mt-1">{verification.transactionId}</p>
              {explorerUrl && (
                <a 
                  href={explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyber-green hover:underline flex items-center mt-1"
                >
                  <ExternalLink size={12} className="mr-1" />
                  View on Explorer
                </a>
              )}
            </div>
          )}
          
          {verification.ipfsHash && (
            <div className="pt-2">
              <p className="flex items-center text-white/60">IPFS Storage:</p>
              <p className="break-all mt-1">{verification.ipfsHash}</p>
              {ipfsUrl && (
                <a 
                  href={ipfsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyber-green hover:underline flex items-center mt-1"
                >
                  <ExternalLink size={12} className="mr-1" />
                  View on IPFS
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 