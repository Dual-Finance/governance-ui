/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
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

const StakingOption = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceStakingOptionForm>({
    soAuthority: undefined,
    soName: undefined,
    optionExpirationUnixSeconds: 0,
    subscriptionPeriodEndUnixSeconds: 0,
    numTokens: 0,
    lotSize: 0,
    baseTreasury: undefined,
    quoteTreasury: undefined,
    userPk: undefined,
    strike: 0,
  })
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    // TODO: Fill this in
    const isValid = await validateInstruction()
    const serializedInstruction = ''
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: undefined,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions({ governedAccount: undefined, getInstruction }, index)
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'soAuthority' })
        }}
        value={form.soAuthority}
        error={formErrors['soAuthority']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="SO Name"
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
      <Input
        label="Option Expiration"
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
        label="Num Tokens"
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
      <Input
        label="Base Treasury"
        value={form.baseTreasury}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'baseTreasury',
          })
        }
        error={formErrors['baseTreasury']}
      />
      <Input
        label="Quote Treasury"
        value={form.quoteTreasury}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'quoteTreasury',
          })
        }
        error={formErrors['quoteTreasury']}
      />
      <Input
        label="User Pk"
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
