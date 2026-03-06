import { Button, Select } from 'antd'
import { DragDropContext } from '@hello-pangea/dnd'
import { useSearchParams } from 'react-router-dom'
import './form-designer.css'
import StepSidebar from './form-designer/components/StepSidebar'
import DesignerWorkspace from './form-designer/components/DesignerWorkspace'
import PreviewPanel from './form-designer/components/PreviewPanel'
import { useFormDesignerState } from './form-designer/hooks/useFormDesignerState'

export default function FormDesigner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const designer = useFormDesignerState(searchParams, setSearchParams)

  return (
    <div style={{ display: 'grid', gap: 24, fontSize: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
        <Select
          placeholder="选择活动"
          style={{ width: 320 }}
          value={designer.selectedActivityId}
          loading={designer.loading}
          options={designer.activities.map((item) => ({ label: item.title, value: item.id }))}
          onChange={(value) => designer.setSelectedActivityId(value)}
        />
        <Button type="primary" size="large" onClick={designer.saveDesigner} loading={designer.saving}>保存</Button>
      </div>

      <DragDropContext onDragEnd={designer.handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr) 360px', gap: 24, alignItems: 'stretch' }}>
          <StepSidebar
            sortedSteps={designer.sortedSteps}
            currentStepKey={designer.currentStepKey}
            fields={designer.fields}
            signupFlow={designer.signupFlow}
            addCustomStep={designer.addCustomStep}
            updateStep={designer.updateStep}
            setActiveStepKey={designer.setActiveStepKey}
            setSignupFlow={designer.setSignupFlow}
            removeStep={designer.removeStep}
          />

          <DesignerWorkspace
            activeStep={designer.activeStep}
            currentStepKey={designer.currentStepKey}
            currentStepFields={designer.currentStepFields}
            bindOptions={designer.bindOptions}
            addField={designer.addField}
            updateField={designer.updateField}
            duplicateField={designer.duplicateField}
            deleteField={designer.deleteField}
            updateFieldOption={designer.updateFieldOption}
            addFieldOption={designer.addFieldOption}
            removeFieldOption={designer.removeFieldOption}
          />

          <PreviewPanel
            activityTitle={designer.activityTitle}
            enabledSteps={designer.enabledSteps}
            currentStepKey={designer.currentStepKey}
            previewFields={designer.previewFields}
            rightPreviewButton={designer.rightPreviewButton}
          />
        </div>
      </DragDropContext>
    </div>
  )
}
