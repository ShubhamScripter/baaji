import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa6';

// Collapsible multi-select filter used on Current Bets.
// `groups` is [{ id, label, options: [{ key, label, count }] }].
// `selected` / `onApply` use a { [groupId]: [keys] } shape; an empty array for
// a group means "no restriction" for that group.
function BetTypeFilter({ groups, selected, onApply, totalCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selected);
  const containerRef = useRef(null);

  // Keep the draft in sync whenever the panel is opened or the applied
  // selection changes elsewhere.
  useEffect(() => {
    setDraft(selected);
  }, [selected, open]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const allSelected = useMemo(
    () => groups.every((group) => (draft[group.id] || []).length === 0),
    [groups, draft]
  );

  const summary = useMemo(() => {
    const labels = groups.flatMap((group) =>
      (selected[group.id] || []).map(
        (key) => group.options.find((option) => option.key === key)?.label || key
      )
    );
    if (labels.length === 0) return 'All bet types';
    if (labels.length <= 2) return labels.join(', ');
    return `${labels.length} bet types`;
  }, [groups, selected]);

  const toggleOption = (groupId, key) => {
    setDraft((prev) => {
      const current = prev[groupId] || [];
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return { ...prev, [groupId]: next };
    });
  };

  const selectAll = () => {
    setDraft(Object.fromEntries(groups.map((group) => [group.id, []])));
  };

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const renderCheckbox = (checked) => (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border ${
        checked
          ? 'border-[#17934e] bg-[#17934e]'
          : 'border-[#6b7680] bg-transparent'
      }`}
    >
      {checked && <FaCheck className="text-[11px] text-white" />}
    </span>
  );

  return (
    <div className="bg-[#1b1f23] p-3" ref={containerRef}>
      <div className="rounded-lg bg-[#2b3138]">
        {/* Header */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9aa4ad]">
              Bet Type
            </span>
            <span className="block text-base font-semibold text-white">
              {summary}
            </span>
          </span>
          {open ? (
            <IoChevronUp className="text-xl text-white" />
          ) : (
            <IoChevronDown className="text-xl text-white" />
          )}
        </button>

        {/* Options */}
        {open && (
          <div className="px-3 pb-3">
            <div className="max-h-64 overflow-y-auto rounded-md border border-[#3a424a] bg-[#22282e]">
              {/* "All" resets every group */}
              <button
                type="button"
                onClick={selectAll}
                className={`flex w-full items-center gap-3 border-b border-[#3a424a] px-3 py-3 text-left ${
                  allSelected ? 'bg-[#123524]' : ''
                }`}
              >
                {renderCheckbox(allSelected)}
                <span className="flex-1 text-sm font-semibold text-white">
                  All
                </span>
                <span className="text-xs text-[#9aa4ad]">{totalCount}</span>
              </button>

              {groups.map((group) => (
                <div key={group.id}>
                  <div className="bg-[#1b1f23] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9aa4ad]">
                    {group.label}
                  </div>
                  {group.options.map((option) => {
                    const checked = (draft[group.id] || []).includes(option.key);
                    return (
                      <button
                        key={`${group.id}-${option.key}`}
                        type="button"
                        onClick={() => toggleOption(group.id, option.key)}
                        className={`flex w-full items-center gap-3 border-b border-[#3a424a] px-3 py-3 text-left ${
                          checked ? 'bg-[#123524]' : ''
                        }`}
                      >
                        {renderCheckbox(checked)}
                        <span className="flex-1 text-sm text-white">
                          {option.label}
                        </span>
                        <span className="text-xs text-[#9aa4ad]">
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 rounded-md border border-[#6b7680] py-2.5 text-sm font-semibold text-white"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-md bg-[#17934e] py-2.5 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BetTypeFilter;
