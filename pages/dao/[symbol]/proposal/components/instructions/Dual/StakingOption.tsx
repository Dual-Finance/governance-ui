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
    subscriptionPeriodEndUnixSeconds: 0,
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
      <Input
        // TT Enter custom Name to identify the Staking Option
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
      <GovernedAccountSelect
        // TT For Calls select Underlying token (Governance Token). For Puts select the Premium token (Stablecoin).
        label="Base Token"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'baseTreasury' })
        }}
        value={form.baseTreasury}
        error={formErrors['baseTreasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <GovernedAccountSelect
        // TT For Calls select the Premium token (Stablecoin). For Puts select Underlying token (Governance Token).
        label="Quote Token"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'quoteTreasury' })
        }}
        value={form.quoteTreasury}
        error={formErrors['quoteTreasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        // TT Enter how many Staking Options you want to create in Base Tokens
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
      <Input
        // TT Enter the date in unix time in seconds that the Staking Option expires
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
      <Input
        // TT Enter the price in Base/Quote integer terms. Use Lot Size to normalize the decimals
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
      <Input
        // Remove this or explain in TT: Enter a date that excess tokens can be withdrawn. If all the Staking Options are issued immediately set to the same unix time as expiration
        label="Subscription Period End"
        value={form.subscriptionPeriodEndUnixSeconds}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'subscriptionPeriodEndUnixSeconds',
          })
        }
        error={formErrors['subscriptionPeriodEndUnixSeconds']}
      />
      <Input
        // Enter integer to normalize the decimals between Base & Quote. For example BTC/USD Puts should be >4
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
      <GovernedAccountSelect
        // TT Enter the account that will pay transaction fees
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
      <Input
        // TT Enter the Solana wallet to recieve the minted Staking Options tokens
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
    </>
  )
}

export default StakingOption
