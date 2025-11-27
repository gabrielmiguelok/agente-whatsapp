/**
 * Archivo: /components/CustomTable/toolbar/components/FilterSocialNetworks.tsx
 */
'use client';

import React, { memo } from 'react';
import FilterAutocomplete from './FilterAutocomplete';
import { socialNetworksOptions } from '../../../utils/socialNetworksOptions';

export interface FilterSocialNetworksProps {
  socialNetworks: string[];                // valores (e.g. ['facebook', 'instagram'])
  setSocialNetworks: (values: string[]) => void;
}

function FilterSocialNetworks({ socialNetworks, setSocialNetworks }: FilterSocialNetworksProps) {
  const selectedLabels = socialNetworksOptions
    .filter((sn) => socialNetworks.includes(sn.value))
    .map((sn) => sn.label);

  const handleChange = (newLabels: string[]) => {
    const selectedValues = socialNetworksOptions
      .filter((opt) => newLabels.includes(opt.label))
      .map((opt) => opt.value);
    setSocialNetworks(selectedValues);
  };

  return (
    <FilterAutocomplete
      label="Redes Sociales"
      options={socialNetworksOptions.map((sn) => sn.label)}
      value={selectedLabels}
      onChange={handleChange}
      popupWidth="220px"
      popupHeight="180px"
    />
  );
}

export default memo(FilterSocialNetworks);
