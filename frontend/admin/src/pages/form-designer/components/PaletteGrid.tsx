import type { DraggableProvidedDraggableProps, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import type { PaletteItem } from '../types'

type PaletteCardArgs = {
  item: PaletteItem
  addField: (item: PaletteItem) => void
  paletteRef?: (element: HTMLDivElement | null) => void
  dragProps?: DraggableProvidedDraggableProps
  snapshot?: DraggableStateSnapshot
}

function PaletteCard({ item, addField, paletteRef, dragProps, snapshot }: PaletteCardArgs) {
  return (
    <div
      ref={paletteRef}
      {...dragProps}
      onClick={() => addField(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          addField(item)
        }
      }}
      style={{
        ...(dragProps?.style || {}),
        borderRadius: 18,
        border: snapshot?.isDragging ? '1px solid var(--frost-primary)' : '1px dashed rgba(148, 163, 184, 0.28)',
        background: 'var(--frost-bg-surface-raised)',
        padding: '12px 14px',
        textAlign: 'left',
        display: 'grid',
        gap: 6,
        cursor: snapshot?.isDragging ? 'grabbing' : 'grab',
        minHeight: 72,
        alignContent: 'start',
        boxShadow: snapshot?.isDragging ? '0 12px 28px rgba(15, 23, 42, 0.18)' : 'none',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--frost-text)' }}>{item.label}</div>
      <div style={{ fontSize: 11, color: 'var(--frost-text-secondary)' }}>
        {item.widget === 'dateTime' ? '日期 + 时间选择器' : item.label}
      </div>
    </div>
  )
}

type Props = {
  items: PaletteItem[]
  addField: (item: PaletteItem) => void
}

export default function PaletteGrid({ items, addField }: Props) {
  return (
    <Droppable
      droppableId="palette-fields"
      direction="horizontal"
      isDropDisabled
      renderClone={(provided, snapshot, rubric) => (
        <PaletteCard
          item={items[rubric.source.index]}
          addField={addField}
          paletteRef={provided.innerRef}
          dragProps={{ ...provided.draggableProps, ...provided.dragHandleProps }}
          snapshot={snapshot}
        />
      )}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}
        >
          {items.map((item, paletteIndex) => (
            <Draggable key={`${item.widget}-${item.label}`} draggableId={`palette-${item.widget}-${paletteIndex}`} index={paletteIndex}>
              {(paletteProvided, paletteSnapshot) => (
                <PaletteCard
                  item={item}
                  addField={addField}
                  paletteRef={paletteProvided.innerRef}
                  dragProps={{ ...paletteProvided.draggableProps, ...paletteProvided.dragHandleProps }}
                  snapshot={paletteSnapshot}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
