import React, { useContext, useEffect, useState } from 'react'
import { ProgramAccount, Governance } from '@solana/spl-governance'
import {
  UiInstruction,
  DualFinanceAirdropCloseForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { getAirdropCloseInstruction } from '@utils/instructions/Dual/airdrop'
import { getDualFinanceAirdropCloseSchema } from '@utils/validations'

const DualAirdropClose = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<DualFinanceAirdropCloseForm>({
    airdropState: '',
    recipient: undefined,
    treasury: undefined,
  })
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { assetAccounts } = useGovernanceAssets()
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const schema = getDualFinanceAirdropCloseSchema()
  function getInstruction(): Promise<UiInstruction> {
    return getAirdropCloseInstruction({
      connection,
      form,
      schema,
      setFormErrors,
      wallet,
    })
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.treasury?.governance)
  }, [form.treasury])

  return (
    <>
      <Tooltip content="Public Key from #6-Account5 found in config tx when the Airdrop was created. Example: 4eBYJahWrE5j4aURDF9EUAHG6dyzJScTkE715Z6dKwU3gJm2UzsbDJaWKovVZKS9FJKzEJ8CLbqAnXTXrj1GPbkh -> Haz1LEuw1CUiRex1ThXAvG2jucpgTwjbtUTby3QMggQ1">
        <Input
          label="Airdrop State"
          value={form.airdropState}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'airdropState',
            })
          }
          error={formErrors['airdropState']}
        />
      </Tooltip>
      <GovernedAccountSelect
        label="Recipient"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'recipient' })
        }}
        value={form.recipient}
        error={formErrors['recipient']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      ></GovernedAccountSelect>
      <GovernedAccountSelect
        label="Treasury"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'treasury' })
        }}
        value={form.treasury}
        error={formErrors['treasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      ></GovernedAccountSelect>
    </>
  )
}

export default DualAirdropClose
