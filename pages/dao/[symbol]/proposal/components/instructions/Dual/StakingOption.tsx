/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import {
  UiInstruction,
  DualFinanceStakingOptionForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { Governance } from '@solana/spl-governance'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { ProgramAccount } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import getConfigInstruction from '@utils/instructions/Dual'
import useWalletStore from 'stores/useWalletStore'
import { getDualFinanceStakingOptionSchema } from '@utils/validations'
import Tooltip from '@components/Tooltip'

const StakingOption = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceStakingOptionForm>({
    soName: undefined,
    optionExpirationUnixSeconds: 0,
    numTokens: 0,
    lotSize: 0,
    baseTreasury: undefined,
    quoteTreasury: undefined,
    payer: undefined,
    userPk: undefined,
    strike: 0,
  })
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)

  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const obj: UiInstruction = await getConfigInstruction({
      connection,
      form,
      schema,
      setFormErrors,
      wallet,
    })
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.baseTreasury?.governance)
  }, [form.baseTreasury])
  const schema = getDualFinanceStakingOptionSchema()

  return (
    <>
      <Tooltip content="Custom name to identify the Staking Option">
        <Input
          label="Name"
          value={form.soName}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'soName',
            })
          }
          error={formErrors['soName']}
        />
      </Tooltip>
      <Tooltip content="Treasury owned account providing the assets for the option">
        <GovernedAccountSelect
          label="Base Treasury"
          governedAccounts={governedTokenAccountsWithoutNfts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'baseTreasury' })
          }}
          value={form.baseTreasury}
          error={formErrors['baseTreasury']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="Treasury owned account receiving payment for the option exercise">
        <GovernedAccountSelect
          label="Quote Treasury"
          governedAccounts={governedTokenAccountsWithoutNfts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'quoteTreasury' })
          }}
          value={form.quoteTreasury}
          error={formErrors['quoteTreasury']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="How many tokens are in the staking options. Units are in atoms of the base token.">
        <Input
          label="Quantity"
          value={form.numTokens}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'numTokens',
            })
          }
          error={formErrors['numTokens']}
        />
      </Tooltip>
      <Tooltip content="Date in unix seconds for option expiration">
        <Input
          label="Expiration"
          value={form.optionExpirationUnixSeconds}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'optionExpirationUnixSeconds',
            })
          }
          error={formErrors['optionExpirationUnixSeconds']}
        />
      </Tooltip>
      <Tooltip content="Strike price for the staking option. Units are atomic quote atoms per lot">
        <Input
          label="Strike"
          value={form.strike}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'strike',
            })
          }
          error={formErrors['strike']}
        />
      </Tooltip>
      <Tooltip content="Lot size for base atoms. This is the min size of an option.">
        <Input
          label="Lot Size"
          value={form.lotSize}
          type="number"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'lotSize',
            })
          }
          error={formErrors['lotSize']}
        />
      </Tooltip>
      <Tooltip content="Rent payer. Should be the governance wallet">
        <GovernedAccountSelect
          label="Payer Account"
          governedAccounts={governedTokenAccountsWithoutNfts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'payer' })
          }}
          value={form.payer}
          error={formErrors['payer']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        ></GovernedAccountSelect>
      </Tooltip>
      <Tooltip content="Recipient of the staking options">
        <Input
          label="Recipient Public Key"
          value={form.userPk}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'userPk',
            })
          }
          error={formErrors['userPk']}
        />
      </Tooltip>
    </>
  )
}

export default StakingOption
