import {
  isValidCreateVCRequest,
  isValidCreateVPRequest,
  isValidDeleteVCRequest,
  isValidQueryRequest,
  isValidResolveDIDRequest,
  isValidSaveVCRequest,
  isValidSwitchMethodRequest,
} from '../../src/utils/params';
import { account } from '../data/constants';
import * as exampleVCPayload from '../data/credentials/examplePayload.json';
import { getDefaultSnapState } from '../data/defaultSnapState';
import * as exampleVC from '../data/verifiable-credentials/exampleJWT.json';

describe('Utils [params]', () => {
  describe('isValidResolveDIDRequest', () => {
    it('should not fail for proper request', () => {
      expect(() =>
        isValidResolveDIDRequest({ did: 'did:ethr:0x1234321' })
      ).not.toThrow(Error);
    });
    it('should fail for null', () => {
      expect(() => isValidResolveDIDRequest(null)).toThrow(Error);
    });
    it('should fail for wrong type', () => {
      expect(() => isValidResolveDIDRequest({ did: 123 })).toThrow(Error);
    });
  });

  describe('isValidQueryRequest', () => {
    it('should fail for not enabled store', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidQueryRequest({ options: { store: 'ceramic' } }, account, state)
      ).toThrow('Store ceramic is not enabled!');
    });
    it('should not fail for null', () => {
      expect(() =>
        isValidQueryRequest(null, account, getDefaultSnapState(account))
      ).not.toThrow(Error);
    });
    it('should not fail for undefined', () => {
      expect(() =>
        isValidQueryRequest(undefined, account, getDefaultSnapState(account))
      ).not.toThrow(Error);
    });
    it('should not fail for empty object', () => {
      expect(() =>
        isValidQueryRequest({}, account, getDefaultSnapState(account))
      ).not.toThrow(Error);
    });
    it('should not fail for object with filter', () => {
      expect(() =>
        isValidQueryRequest(
          { filter: { type: 'abc', filter: {} } },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow(Error);
    });
    it('should fail for filter without type', () => {
      expect(() =>
        isValidQueryRequest(
          { filter: { filter: {} } },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Filter type is missing or not a string!');
    });
    it('should fail for filter with wrong type type', () => {
      expect(() =>
        isValidQueryRequest(
          { filter: { type: 123, filter: {} } },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Filter type is missing or not a string!');
    });
    it('should not fail for empty options object', () => {
      expect(() =>
        isValidQueryRequest(
          { options: {} },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Filter type is missing or not a string!');
    });
    it('should not fail for options object with one store', () => {
      expect(() =>
        isValidQueryRequest(
          { options: { store: 'snap' } },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Filter type is missing or not a string!');
    });
    it('should not fail for options object with multiple stores', () => {
      expect(() =>
        isValidQueryRequest(
          { options: { store: ['snap', 'ceramic'] } },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Filter type is missing or not a string!');
    });
    it('should not fail for options object with wrong store', () => {
      expect(() =>
        isValidQueryRequest(
          { options: { store: ['snapp', 'ceramic'] } },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Store snapp is not supported!');
    });
    it('should not fail for options object with wrong type store', () => {
      expect(() =>
        isValidQueryRequest(
          { options: { store: true } },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Store is invalid format');
    });
    it('should not fail for options object with multiple stores and returnStore', () => {
      expect(() =>
        isValidQueryRequest(
          {
            options: { store: ['snap', 'ceramic'], returnStore: false },
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Filter type is missing or not a string!');
    });
    it('should fail for options object with multiple stores and wrong type returnStore', () => {
      expect(() =>
        isValidQueryRequest(
          {
            options: { store: ['snap', 'ceramic'], returnStore: 123 },
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('ReturnStore is invalid format');
    });
  });

  /*
      isValidSaveVCRequest
    */
  describe('isValidSaveVCRequest', () => {
    it('should fail for null', () => {
      expect(() =>
        isValidSaveVCRequest(null, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });

    it('should fail for empty object', () => {
      expect(() =>
        isValidSaveVCRequest({}, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });

    it('should fail for string', () => {
      expect(() =>
        isValidSaveVCRequest(
          'infuraToken',
          account,
          getDefaultSnapState(account)
        )
      ).toThrow(Error);
    });

    it('should fail for number', () => {
      expect(() =>
        isValidSaveVCRequest(42, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });
    it('should fail for not enabled store', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidSaveVCRequest(
          { verifiableCredential: exampleVC, options: { store: 'ceramic' } },
          account,
          state
        )
      ).toThrow('Store ceramic is not enabled!');
    });
  });

  /*
      isValidCreateVPRequest
    */
  describe('isValidCreateVPRequest', () => {
    it('should succeed if vcId is a string', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id' }, { id: 'test-id-2' }],
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow();
    });

    it('should succeed if all params are strings', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id' }, { id: 'test-id-2' }],
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow();
    });

    it('should fail for null', () => {
      expect(() =>
        isValidCreateVPRequest(null, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });

    it('should fail for empty object', () => {
      expect(() =>
        isValidCreateVPRequest({}, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });

    it('should fail for string', () => {
      expect(() =>
        isValidCreateVPRequest(
          'infuraToken',
          account,
          getDefaultSnapState(account)
        )
      ).toThrow(Error);
    });

    it('should fail for number', () => {
      expect(() =>
        isValidCreateVPRequest(42, account, getDefaultSnapState(account))
      ).toThrow(Error);
    });

    it('should fail if vcs array is empty', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [],
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow(Error);
    });

    it('should fail if vcs is null', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: null,
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Invalid CreateVP request');
    });
    it('should fail if proofFormat is wrong', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id' }],
            proofFormat: 'wrong',
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Proof format not supported');
    });
    it('should not throw request with proofFormat and options', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: {} }],
            proofFormat: 'jwt',
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('err');
    });
    it('should not throw request with proofFormat and options and metadata', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('err');
    });

    it('should not throw request with proofFormat and proofOptions', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
            proofOptions: {},
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Store is not supported!');
    });
    it('should not throw request with proofFormat and proofOptions with domain and challenge', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
            proofOptions: { domain: 'test', challenge: 'test' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Store is not supported!');
    });
    it('should throw domain is not a string', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
            proofOptions: { domain: 123, challenge: 'test' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Domain is not a string');
    });
    it('should throw challenge is not a string', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
            proofOptions: { challenge: 123, domain: 'test' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Challenge is not a string');
    });
    it('should throw type is not a string', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [{ id: 'test-id', metadata: { store: 'snap' } }],
            proofFormat: 'jwt',
            proofOptions: { type: 123, challenge: 'test', domain: 'test' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Type is not a string');
    });
    it('should not throw complete request', () => {
      expect(() =>
        isValidCreateVPRequest(
          {
            vcs: [
              { id: 'test-id', metadata: { store: 'snap' } },
              { id: 'test-id', metadata: { store: 'ceramic' } },
              { id: 'test-id' },
              { id: 'test-id', metadata: {} },
            ],
            proofFormat: 'lds',
            proofOptions: { type: 'Eth', domain: 'test', challenge: 'test' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow('Store is not supported!');
    });
  });

  /*
      isValidSwitchMethodRequest
    */
  describe('isValidSwitchMethodRequest', () => {
    it('should succeed if didMethod is a valid string', () => {
      expect(() =>
        isValidSwitchMethodRequest({ didMethod: 'did:ethr' })
      ).not.toThrow();
    });

    it('should fail for null', () => {
      expect(() => isValidSwitchMethodRequest(null)).toThrow(Error);
    });

    it('should fail for wrong string', () => {
      expect(() =>
        isValidSwitchMethodRequest({ didMethod: 'did:ethrr' })
      ).toThrow(Error);
    });
    it('should fail for empty object', () => {
      expect(() => isValidSwitchMethodRequest({})).toThrow(Error);
    });

    it('should fail for string', () => {
      expect(() => isValidSwitchMethodRequest('infuraToken')).toThrow(Error);
    });

    it('should fail for number', () => {
      expect(() => isValidSwitchMethodRequest(42)).toThrow(Error);
    });

    it('should fail if didMethod is null', () => {
      expect(() => isValidSwitchMethodRequest({ didMethod: null })).toThrow(
        Error
      );
    });

    it('should fail if didMethod is a number', () => {
      expect(() => isValidSwitchMethodRequest({ didMethod: 42 })).toThrow(
        Error
      );
    });
  });
  describe('isValidDeleteVCsRequest', () => {
    it('should fail for not enabled store', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidDeleteVCRequest(
          { id: '123', options: { store: 'ceramic' } },
          account,
          state
        )
      ).toThrow('Store ceramic is not enabled!');
    });
    it('should fail if didMethod is a number', () => {
      expect(() =>
        isValidDeleteVCRequest(
          { didMethod: 42 },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow(Error);
    });
    it('should not throw for string id', () => {
      expect(() =>
        isValidDeleteVCRequest(
          { id: '123' },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow(Error);
    });
    it('should not throw for list of string ids', () => {
      expect(() =>
        isValidDeleteVCRequest(
          { id: ['123', '456'] },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow(Error);
    });
    it('should not throw for list of string ids and store', () => {
      expect(() =>
        isValidDeleteVCRequest(
          {
            id: ['123', '456'],
            options: { store: 'snap' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow(Error);
    });
    it('should not throw for list of string ids and list of stores', () => {
      expect(() =>
        isValidDeleteVCRequest(
          {
            id: ['123', '456'],
            options: { store: ['snap', 'ceramic'] },
          },
          account,
          getDefaultSnapState(account)
        )
      ).not.toThrow(Error);
    });
    it('should throw for list of string ids and wrong store', () => {
      expect(() =>
        isValidDeleteVCRequest(
          {
            id: ['123', '456'],
            options: { store: 'snapp' },
          },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('Store snapp is not supported!');
    });
    it('should throw for list of not string ids', () => {
      expect(() =>
        isValidDeleteVCRequest(
          { id: ['123', 456] },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('ID is not a string or array of strings');
    });
    it('should throw for empty list of ids', () => {
      expect(() =>
        isValidDeleteVCRequest(
          { id: [] },
          account,
          getDefaultSnapState(account)
        )
      ).toThrow('ID is not a string or array of strings');
    });
  });
  describe('isValidCreateVCsRequest', () => {
    it('should pass with only unsignedVC', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
          },
          account,
          state
        )
      ).not.toThrow();
    });
    it('should pass with unsignedVC & PF', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
          },
          account,
          state
        )
      ).not.toThrow();
    });
    it('should pass with empty options', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
            options: {},
          },
          account,
          state
        )
      ).not.toThrow();
    });
    it('should pass with save option', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
            options: { save: true },
          },
          account,
          state
        )
      ).not.toThrow();
    });
    it('should pass with full option', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
            options: { save: true, store: ['snap'] },
          },
          account,
          state
        )
      ).not.toThrow();
    });
    it('should fail for not enabled store', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
            options: { save: true, store: 'ceramic' },
          },
          account,
          state
        )
      ).toThrow('Store ceramic is not enabled!');
    });
    it('should fail for invalid store', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jwt',
            options: { save: true, store: 'ceramicc' },
          },
          account,
          state
        )
      ).toThrow('Store ceramicc is not supported!');
    });
    it('should fail for invalid PF', () => {
      const state = getDefaultSnapState(account);
      state.accountState[account].accountConfig.ssi.vcStore.ceramic = false;
      expect(() =>
        isValidCreateVCRequest(
          {
            minimalUnsignedCredential: exampleVCPayload,
            proofFormat: 'jws',
            options: { save: true, store: 'snap' },
          },
          account,
          state
        )
      ).toThrow('Proof format not supported');
    });
  });
});