/**
 * Archivo: /components/CustomTable/toolbar/components/IconFilterDropdown.tsx
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import Select, { MultiValue } from 'react-select';

export interface IconFilterDropdownProps {
  icon: React.ReactNode;
  tooltip?: string;
  options?: string[];
  value?: string[];
  onChange: (values: string[]) => void;
}

type Opt = { value: string; label: string };

export default function IconFilterDropdown({
  icon,
  tooltip,
  options = [],
  value = [],
  onChange
}: IconFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // strings -> { value, label }
  const selectOptions: Opt[] = options.map((opt) => ({ value: opt, label: opt }));
  const selectValue: Opt[] = value.map((val) => ({ value: val, label: val }));
  const hasSelected = value.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIconClick = () => setIsOpen((prev) => !prev);

  const handleSelectChange = (selected: MultiValue<Opt>) => {
    const newValues = selected.map((s) => s.value);
    onChange(newValues);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontSize: '18px'
      }}
    >
      <Tooltip title={tooltip || ''}>
        <Badge
          badgeContent={hasSelected ? value.length : 0}
          color="primary"
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              minWidth: '14px',
              height: '14px',
              padding: '0 4px'
            }
          }}
        >
          <IconButton
            onClick={handleIconClick}
            sx={{
              transition: 'none',
              p: 0.3,
              mr: 0.5,
              color: hasSelected ? '#41a9ff' : '#ffffff',
              '&:hover': { backgroundColor: 'transparent' },
              fontSize: 'inherit'
            }}
          >
            {icon}
          </IconButton>
        </Badge>
      </Tooltip>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 9999,
            width: '200px',
            padding: '4px'
          }}
        >
          <Select
            options={selectOptions}
            value={selectValue}
            onChange={handleSelectChange}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuIsOpen
            placeholder="Seleccione..."
            styles={{
              control: (base) => ({ ...base, minHeight: '32px', fontSize: '0.8rem' }),
              menu: (base) => ({
                ...base,
                position: 'relative',
                boxShadow: 'none',
                border: '1px solid #ddd',
                marginTop: '4px',
                zIndex: 10000
              }),
              option: (base) => ({
                ...base,
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              })
            }}
          />
        </div>
      )}
    </div>
  );
}
