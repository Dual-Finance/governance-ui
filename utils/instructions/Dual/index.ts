import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { StakingOptions } from '@dual-finance/staking-options'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceStakingOptionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { PublicKeyLayout } from '@blockworks-foundation/mango-client'

interface Args {
  connection: ConnectionContext
  form: DualFinanceStakingOptionForm
  setFormErrors: any // TODO
  schema: any // TODO
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

  const serializedInstruction = ''

  if (
    isValid &&
    form.soName &&
    form.soAuthority &&
    form.baseTreasury &&
    form.quoteTreasury
  ) {
    const so = getStakingOptionsApi(connection)
    // TODO: Lookup the mints from the token accounts
    // TODO: Add instructions to create ata
    const baseMint = new PublicKey('')
    const quoteMint = new PublicKey('')

    const instruction = await so.createConfigInstruction(
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

    const additionalSerializedInstructions = [
      serializeInstructionToBase64(instruction),
    ]

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
    additionalSerializedInstructions: [],
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
