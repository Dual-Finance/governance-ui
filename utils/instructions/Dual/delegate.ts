import {
  TokenOwnerRecord,
  getGovernanceProgramVersion,
  getTokenOwnerRecordAddress,
  serializeInstructionToBase64,
  withCreateTokenOwnerRecord,
  withDepositGoverningTokens,
  withSetGovernanceDelegate,
  ProgramAccount,
  getTokenOwnerRecordForRealm,
} from '@solana/spl-governance'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceVoteDepositForm,
  DualFinanceDelegateForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

interface DelegateArgs {
  connection: ConnectionContext
  form: DualFinanceDelegateForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

interface VoteDepositArgs {
  connection: ConnectionContext
  form: DualFinanceVoteDepositForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getDelegateInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: DelegateArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.delegateAccount &&
    wallet?.publicKey &&
    form.realm &&
    form.delegateToken &&
    form.delegateToken.extensions.mint?.publicKey
  ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      form.delegateToken?.governance.owner // governance program public key
    )
    // TODO: Make this instruction work
    await withSetGovernanceDelegate(
      prerequisiteInstructions,
      form.delegateToken?.governance.owner, // publicKey of program/programId
      programVersion, // program version of realm
      new PublicKey(form.realm), // realm public key
      form.delegateToken.extensions.mint.publicKey, // mint of governance token
      wallet.publicKey, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      wallet.publicKey, // governanceAuthority: publicKey of connected wallet
      new PublicKey(form.delegateAccount) // public key of wallet who to delegated vote to
    )
  }
  return {
    serializedInstruction,
    isValid: true,
    prerequisiteInstructions: prerequisiteInstructions,
    governance: form.delegateToken?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
}

export async function getVoteDepositInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: VoteDepositArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  const prerequisiteInstructions: TransactionInstruction[] = []
  const instructions: TransactionInstruction[] = []
  if (
    isValid &&
    form.numTokens &&
    wallet?.publicKey &&
    form.realm &&
    form.delegateToken &&
    form.delegateToken.extensions.mint?.publicKey
  ) {
    const programVersion = await getGovernanceProgramVersion(
      connection.current,
      form.delegateToken.governance.owner // governance program public key
    )
    const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
      form.delegateToken.governance.owner,
      new PublicKey(form.realm),
      form.delegateToken.extensions.mint.publicKey,
      form.delegateToken.governance.nativeTreasuryAddress
    )
    let existingTokenOwnerRecord: null | ProgramAccount<TokenOwnerRecord> = null
    try {
      existingTokenOwnerRecord = await getTokenOwnerRecordForRealm(
        connection.current,
        form.delegateToken.governance.owner,
        new PublicKey(form.realm),
        form.delegateToken.extensions.mint.publicKey,
        form.delegateToken.governance.nativeTreasuryAddress
      )
    } catch (e) {
      console.log(e)
    }

    console.log(existingTokenOwnerRecord)
    if (!existingTokenOwnerRecord) {
      console.log(
        'Creating new vote record',
        tokenOwnerRecordAddress.toBase58(),
        connection.current.rpcEndpoint
      )
      await withCreateTokenOwnerRecord(
        instructions,
        form.delegateToken.governance.owner,
        programVersion,
        new PublicKey(form.realm),
        form.delegateToken.governance.nativeTreasuryAddress,
        form.delegateToken.extensions.mint.publicKey,
        form.delegateToken.governance.nativeTreasuryAddress
      )
    }

    await withDepositGoverningTokens(
      instructions,
      form.delegateToken.governance.owner, // publicKey of program/programId
      programVersion, // program version of realm
      new PublicKey(form.realm), // realm public key
      form.delegateToken.pubkey,
      form.delegateToken.extensions.mint.publicKey, // mint of governance token
      form.delegateToken.governance.nativeTreasuryAddress, // governingTokenOwner (walletId) publicKey of tokenOwnerRecord of this wallet
      form.delegateToken.governance.nativeTreasuryAddress, // governanceAuthority: publicKey of connected wallet
      form.delegateToken.governance.nativeTreasuryAddress,
      getMintNaturalAmountFromDecimalAsBN(
        form.numTokens,
        form.delegateToken.extensions.mint.account.decimals
      )
    )
    for (const ix of instructions) {
      additionalSerializedInstructions.push(serializeInstructionToBase64(ix))
    }
    console.log(instructions)
  }

  return {
    serializedInstruction,
    isValid: true,
    prerequisiteInstructions: prerequisiteInstructions,
    governance: form.delegateToken?.governance,
    additionalSerializedInstructions,
    chunkBy: 1,
  }
}

// TODO: Add withdraw delegate instructions withWithdrawGoverningTokens
