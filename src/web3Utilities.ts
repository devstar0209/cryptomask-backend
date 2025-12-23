import { recoverAddress, hashMessage } from "ethers";
import { isDev } from "./utility";

export const verifyPersonalSign = ({
  message,
  hash,
  address,
  
}: {
  message: string;
  hash: string;
  address: string;
}) => {
  const messageHash = hashMessage(message);
  try {
    const signerAddress = recoverAddress(messageHash, hash);
    if (isDev()) {
      console.log("Signer address ===>", signerAddress);
    }
    if (signerAddress.toLowerCase() === address.toLowerCase()) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
