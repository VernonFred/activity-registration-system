import type { ActivityCreateFormState } from '../types'
import {
  BasicInfoSection,
  DescriptionSection,
  LocationSection,
  TimingSection,
} from './overview-sections'
import { SettingsSection } from './overview-settings-section'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function OverviewTab({ state, onChange }: Props) {
  const updateBase = <K extends keyof ActivityCreateFormState['base']>(key: K, value: ActivityCreateFormState['base'][K]) => {
    onChange({
      ...state,
      base: {
        ...state.base,
        [key]: value,
      },
    })
  }

  const updateOverview = (patch: Partial<ActivityCreateFormState['extra']['overview']>) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        overview: {
          ...state.extra.overview,
          ...patch,
        },
      },
    })
  }

  const handleOpenCoordPicker = () => {
    window.open('https://lbs.qq.com/getPoint/', '_blank')
  }

  return (
    <div className="overview-tab">
      <div className="overview-tab__row overview-tab__row--stretch">
        <BasicInfoSection state={state} updateBase={updateBase} />
        <TimingSection state={state} updateBase={updateBase} />
      </div>
      <LocationSection
        state={state}
        updateBase={updateBase}
        updateOverview={updateOverview}
        onOpenCoordPicker={handleOpenCoordPicker}
      />
      <DescriptionSection state={state} updateBase={updateBase} />
      <SettingsSection state={state} updateBase={updateBase} updateOverview={updateOverview} />
    </div>
  )
}
