/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Core interfaces
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
} from "@veramo/core";

import { AbstractIdentifierProvider, DIDManager } from "@veramo/did-manager";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { KeyManager } from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import { VCManager, IVCManager } from "@blockchain-lab-um/veramo-vc-manager";
import { Web3Provider } from "@ethersproject/providers";
import { Web3KeyManagementSystem } from "@veramo/kms-web3";
import {
  CredentialIssuerEIP712,
  ICredentialIssuerEIP712,
} from "@veramo/credential-eip712";
import { SdrMessageHandler } from "@veramo/selective-disclosure";
import { JwtMessageHandler } from "@veramo/did-jwt";
import { MessageHandler } from "@veramo/message-handler";
import {
  SnapDIDStore,
  SnapKeyStore,
  SnapVCStore,
  SnapPrivateKeyStore,
} from "./plugins/snapDataStore/snapDataStore";

import {
  CredentialIssuer,
  ICredentialIssuer,
  W3cMessageHandler,
} from "@veramo/credential-w3c";

import { KeyDIDProvider } from "../did/key/key-did-provider";
import { getDidKeyResolver as keyDidResolver } from "../did/key/key-did-resolver";

const availableNetworks: Record<string, string> = {
  "0x01": "mainnet",
  "0x04": "rinkeby",
};

import { getSnapConfig } from "../utils/state_utils";
import { getCurrentNetwork } from "../utils/snap_utils";

export const getAgent = async (): Promise<any> => {
  const snapConfig = await getSnapConfig();

  const INFURA_PROJECT_ID = snapConfig.snap.infuraToken;
  const CHAIN_ID = await getCurrentNetwork();
  console.log("INFURA_PROJECT_ID", INFURA_PROJECT_ID, "CHAIN ID", CHAIN_ID);

  const web3Providers: Record<string, Web3Provider> = {};
  const didProviders: Record<string, AbstractIdentifierProvider> = {};

  web3Providers["metamask"] = new Web3Provider(wallet as any);

  didProviders["did:ethr"] = new EthrDIDProvider({
    defaultKms: "web3",
    network: "rinkeby",
    rpcUrl:
      `https://${availableNetworks[CHAIN_ID] ?? "mainnet"}.infura.io/v3/` +
      INFURA_PROJECT_ID,
    web3Provider: new Web3Provider(wallet as any),
  });
  // didProviders["snap"] = new EthrDIDProvider({
  //   defaultKms: "snap",
  //   network: "rinkeby",
  //   rpcUrl: "https://rinkeby.infura.io/v3/" + INFURA_PROJECT_ID,
  //   web3Provider: new Web3Provider(wallet as any),
  // });

  didProviders["did:key"] = new KeyDIDProvider({ defaultKms: "web3" });

  const agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IResolver &
      IVCManager &
      ICredentialIssuerEIP712 &
      ICredentialIssuer
  >({
    plugins: [
      new KeyManager({
        store: new SnapKeyStore(),
        kms: {
          web3: new Web3KeyManagementSystem(web3Providers),
          snap: new KeyManagementSystem(new SnapPrivateKeyStore()),
        },
      }),
      new DIDManager({
        store: new SnapDIDStore(),
        defaultProvider: "metamask",
        providers: didProviders,
      }),
      new VCManager({ store: new SnapVCStore() }),
      new CredentialIssuer(),
      new CredentialIssuerEIP712(),
      new MessageHandler({
        messageHandlers: [
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
          ...keyDidResolver(),
        }),
      }),
    ],
  });

  return agent;
};
