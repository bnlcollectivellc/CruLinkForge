'use client';

import { useState, useCallback } from 'react';
import type { BendLine, SelectableEdge, BendDirection, BendType } from '@/types';

interface BendEditorPanelProps {
  selectedEdge: SelectableEdge | null;
  existingBends: BendLine[];
  onAddBend: (bend: Omit<BendLine, 'id' | 'sequence' | 'bendRadius' | 'bendAllowance' | 'kFactor'>) => void;
  onUpdateBend: (bendId: string, updates: Partial<BendLine>) => void;
  onRemoveBend: (bendId: string) => void;
  onClearBends: () => void;
  onCancel: () => void;
  className?: string;
}

const BEND_TYPES: Array<{ id: BendType; label: string; description: string }> = [
  { id: 'simple', label: 'Simple Bend', description: 'Standard 90 degree bend' },
  { id: 'hem', label: 'Hem', description: 'Fold edge back on itself for safety' },
  { id: 'channel', label: 'Channel', description: 'U-shape bend for channels' },
  { id: 'offset', label: 'Offset', description: 'Z-shape step bend' },
];

const PRESET_ANGLES = [45, 90, 120, 135];

export default function BendEditorPanel({
  selectedEdge,
  existingBends,
  onAddBend,
  onUpdateBend,
  onRemoveBend,
  onClearBends,
  onCancel,
  className = '',
}: BendEditorPanelProps) {
  const [angle, setAngle] = useState(90);
  const [direction, setDirection] = useState<BendDirection>('up');
  const [bendType, setBendType] = useState<BendType>('simple');
  const [editingBendId, setEditingBendId] = useState<string | null>(null);

  // Handle adding a new bend
  const handleAddBend = useCallback(() => {
    if (!selectedEdge) return;

    onAddBend({
      startPoint: selectedEdge.startPoint,
      endPoint: selectedEdge.endPoint,
      angle,
      direction,
      bendType,
    });

    // Reset form
    setAngle(90);
    setDirection('up');
    setBendType('simple');
  }, [selectedEdge, angle, direction, bendType, onAddBend]);

  // Handle editing an existing bend
  const handleEditBend = (bend: BendLine) => {
    setEditingBendId(bend.id);
    setAngle(bend.angle);
    setDirection(bend.direction);
    setBendType(bend.bendType);
  };

  // Handle saving edit
  const handleSaveEdit = useCallback(() => {
    if (!editingBendId) return;

    onUpdateBend(editingBendId, {
      angle,
      direction,
      bendType,
    });

    setEditingBendId(null);
    setAngle(90);
    setDirection('up');
    setBendType('simple');
  }, [editingBendId, angle, direction, bendType, onUpdateBend]);

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingBendId(null);
    setAngle(90);
    setDirection('up');
    setBendType('simple');
  };

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">Bend Configuration</h3>
        <p className="text-sm text-neutral-500">
          {selectedEdge
            ? `Selected edge: ${selectedEdge.length.toFixed(2)}" long`
            : existingBends.length > 0
            ? `${existingBends.length} bend${existingBends.length > 1 ? 's' : ''} configured`
            : 'Select an edge on the part to add a bend'}
        </p>
      </div>

      {/* New Bend Form (shown when edge is selected) */}
      {selectedEdge && !editingBendId && (
        <div className="p-4 space-y-4 border-b border-neutral-200 bg-blue-50/50">
          <div className="text-sm font-medium text-blue-700">New Bend</div>

          {/* Bend Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Bend Type</label>
            <div className="grid grid-cols-2 gap-2">
              {BEND_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setBendType(type.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    bendType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-neutral-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bend Angle: {angle}°
            </label>
            <div className="flex gap-2 mb-2">
              {PRESET_ANGLES.map(preset => (
                <button
                  key={preset}
                  onClick={() => setAngle(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    angle === preset
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {preset}°
                </button>
              ))}
            </div>
            <input
              type="range"
              min={15}
              max={180}
              step={5}
              value={angle}
              onChange={e => setAngle(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Direction</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('up')}
                className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  direction === 'up'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm font-medium">Bend Up</span>
                <span className="text-xs text-neutral-500">Toward viewer</span>
              </button>
              <button
                onClick={() => setDirection('down')}
                className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                  direction === 'down'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm font-medium">Bend Down</span>
                <span className="text-xs text-neutral-500">Away from viewer</span>
              </button>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex gap-2">
            <button
              onClick={handleAddBend}
              className="flex-1 bg-blue-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Add Bend
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Bends List */}
      {existingBends.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-neutral-700">Configured Bends</h4>
            <button
              onClick={onClearBends}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {existingBends.map((bend, index) => (
              <div
                key={bend.id}
                className={`p-3 rounded-lg border ${
                  editingBendId === bend.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200'
                }`}
              >
                {editingBendId === bend.id ? (
                  // Editing mode
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-blue-700">Editing Bend #{bend.sequence}</div>

                    {/* Quick type select */}
                    <div className="flex flex-wrap gap-1">
                      {BEND_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setBendType(type.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            bendType === type.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Angle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600">Angle:</span>
                      <input
                        type="number"
                        min={15}
                        max={180}
                        step={5}
                        value={angle}
                        onChange={e => setAngle(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
                      />
                      <span className="text-sm text-neutral-600">°</span>
                    </div>

                    {/* Direction toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDirection('up')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          direction === 'up'
                            ? 'bg-orange-500 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        Up
                      </button>
                      <button
                        onClick={() => setDirection('down')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          direction === 'down'
                            ? 'bg-purple-500 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        Down
                      </button>
                    </div>

                    {/* Save/Cancel */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-blue-500 text-white py-1.5 rounded text-sm font-medium hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          bend.direction === 'up' ? 'bg-orange-500' : 'bg-purple-500'
                        }`}
                      >
                        {bend.sequence}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {BEND_TYPES.find(t => t.id === bend.bendType)?.label || 'Simple Bend'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {bend.angle}° • {bend.direction === 'up' ? 'Up' : 'Down'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditBend(bend)}
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700"
                        title="Edit bend"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onRemoveBend(bend.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600"
                        title="Remove bend"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {existingBends.length === 0 && !selectedEdge && (
        <div className="p-6 text-center text-neutral-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Click on a highlighted edge in the preview to add a bend line</p>
        </div>
      )}
    </div>
  );
}
