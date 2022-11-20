import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { StakingOptions } from '@dual-finance/staking-options'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceStakingOptionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '@utils/associated'
import { tryGetTokenAccount } from '@utils/tokens'
import useWallet from '@hooks/useWallet'

interface Args {
  connection: ConnectionContext
  form: DualFinanceStakingOptionForm
  setFormErrors: any
  schema: any
}

function getStakingOptionsApi(connection: ConnectionContext) {
  return new StakingOptions(connection.endpoint, 'confirmed')
}

export default async function getConfigInstruction({
  connection,
  form,
  schema,
  setFormErrors,
}: Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const { wallet } = useWallet()

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []

  if (
    isValid &&
    form.soName &&
    form.soAuthority &&
    form.baseTreasury &&
    form.quoteTreasury &&
    form.userPk &&
    wallet?.publicKey
  ) {
    const so = getStakingOptionsApi(connection)
    const baseTreasuryAccount = await tryGetTokenAccount(
      connection.current,
      new PublicKey(form.baseTreasury)
    )
    const baseMint = baseTreasuryAccount?.account.mint
    const quoteTreasuryAccount = await tryGetTokenAccount(
      connection.current,
      new PublicKey(form.quoteTreasury)
    )
    const quoteMint = quoteTreasuryAccount?.account.mint

    if (!baseMint || !quoteMint) {
      return {
        serializedInstruction,
        isValid: false,
        governance: form.soAuthority?.governance,
        additionalSerializedInstructions: [],
        chunkSplitByDefault: true,
        chunkBy: 1,
      }
    }

    const configInstruction = await so.createConfigInstruction(
      form.optionExpirationUnixSeconds,
      form.subscriptionPeriodEndUnixSeconds,
      form.numTokens,
      form.lotSize,
      form.soName,
      new PublicKey(form.soAuthority),
      baseMint,
      new PublicKey(form.baseTreasury),
      quoteMint,
      new PublicKey(form.quoteTreasury)
    )

    const initStrikeInstruction = await so.createInitStrikeInstruction(
      form.strike,
      form.soName,
      new PublicKey(form.soAuthority),
      baseMint
    )

    const soMint = await so.soMint(form.strike, form.soName, baseMint)
    const userSoAccount = await findAssociatedTokenAddress(
      new PublicKey(form.userPk),
      soMint
    )

    if (!(await connection.current.getAccountInfo(userSoAccount))) {
      const [ataIx] = await createAssociatedTokenAccount(
        wallet.publicKey,
        new PublicKey(form.userPk),
        soMint
      )
      additionalSerializedInstructions.concat(
        serializeInstructionToBase64(ataIx)
      )
    }

    const issueInstruction = await so.createIssueInstruction(
      form.numTokens,
      form.strike,
      form.soName,
      new PublicKey(form.soAuthority),
      baseMint,
      userSoAccount
    )

    additionalSerializedInstructions.concat(
      serializeInstructionToBase64(configInstruction)
    )
    additionalSerializedInstructions.concat(
      serializeInstructionToBase64(initStrikeInstruction)
    )
    additionalSerializedInstructions.concat(
      serializeInstructionToBase64(issueInstruction)
    )

    const obj: UiInstruction = {
      serializedInstruction,
      isValid: true,
      governance: form.soAuthority?.governance,
      additionalSerializedInstructions,
      chunkSplitByDefault: true,
      chunkBy: 1,
    }
    return obj
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.soAuthority?.governance,
    additionalSerializedInstructions,
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
