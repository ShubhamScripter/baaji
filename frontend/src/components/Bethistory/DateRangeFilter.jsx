import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AiFillCalendar } from 'react-icons/ai';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DATE_PRESETS, formatDate } from '../../utils/dateRangePresets';

// Period dropdown + custom range picker.
// `onChange` receives { startDate, endDate } as YYYY-MM-DD strings.
function DateRangeFilter({ startDate, endDate, onChange }) {
  const [preset, setPreset] = useState('1month');
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const customRange = useMemo(
    () => [
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        key: 'selection',
      },
    ],
    [startDate, endDate]
  );

  const [draftRange, setDraftRange] = useState(customRange);

  useEffect(() => {
    setDraftRange(customRange);
  }, [customRange]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const handlePresetChange = (event) => {
    const key = event.target.value;
    setPreset(key);

    const selected = DATE_PRESETS.find((item) => item.key === key);
    if (!selected?.range) {
      // Custom: keep the current range and let the user pick one.
      setShowCalendar(true);
      return;
    }

    const [from, to] = selected.range();
    onChange({ startDate: formatDate(from), endDate: formatDate(to) });
    setShowCalendar(false);
  };

  const applyCustomRange = () => {
    const { startDate: from, endDate: to } = draftRange[0];
    onChange({ startDate: formatDate(from), endDate: formatDate(to) });
    setShowCalendar(false);
  };

  return (
    <div className="bg-[#262c32] p-4">
      {/* Preset dropdown */}
      <div className="relative flex items-center justify-between">
        <select
          name="Period"
          className="w-full rounded-lg bg-[#1b1f23] py-2 pl-20 text-white"
          value={preset}
          onChange={handlePresetChange}
        >
          {DATE_PRESETS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="absolute left-0 pl-2 text-white">Period</span>
      </div>

      {/* Applied range / custom picker */}
      <div className="relative mt-3 w-max" ref={calendarRef}>
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-[#17934e] bg-transparent px-3 py-2 text-sm text-[#17934e]"
          onClick={() => {
            setPreset('custom');
            setShowCalendar((prev) => !prev);
          }}
        >
          <AiFillCalendar />
          {new Date(startDate).toLocaleDateString()} -{' '}
          {new Date(endDate).toLocaleDateString()}
        </button>
        {showCalendar && (
          <div className="absolute z-50 mt-2 rounded bg-white shadow-lg">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDraftRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={draftRange}
              maxDate={new Date()}
            />
            <button
              type="button"
              onClick={applyCustomRange}
              className="w-full rounded-b bg-[#17934e] py-2 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateRangeFilter;
