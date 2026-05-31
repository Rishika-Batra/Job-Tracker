'use client';

import { Status, Job } from '@/lib/types';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  jobs: Job[];
  onStatusChange: (jobId: string, newStatus: Status) => void;
}

const COLUMNS: Status[] = ['applied', 'interview', 'offer', 'accepted', 'rejected'];

export default function KanbanBoard({ jobs, onStatusChange }: KanbanBoardProps) {
  // Configure sensors for drag-and-drop.
  // We use distance activation constraint of 8px so dragging doesn't immediately intercept onClick navigation or button actions.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const activeJob = jobs.find((j) => j.id === jobId);
    if (!activeJob) return;

    let newStatus: Status;

    // Check if the drop target ID is one of the Status values (columns)
    const isOverColumn = COLUMNS.includes(over.id as Status);

    if (isOverColumn) {
      newStatus = over.id as Status;
    } else {
      // If we dropped over another job card, extract the status from that target card
      const targetJob = jobs.find((j) => j.id === over.id);
      if (!targetJob) return;
      newStatus = targetJob.status;
    }

    if (activeJob.status !== newStatus) {
      onStatusChange(jobId, newStatus);
    }
  };

  // Group jobs dynamically by their status key
  const getJobsByStatus = (status: Status) => {
    return jobs.filter((job) => job.status === status);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={getJobsByStatus(status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
