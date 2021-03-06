import React, { Fragment, FC, useEffect, useState } from 'react';
import { Theme, TextField, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from './MahanIcon';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  space: {
    width: theme.spacing(1)
  }
}));

export interface SearchProps {
  outlined?: boolean;
  initialSearch?: string;
  onQueryChange?: (query: ReadonlyArray<string>) => void;
  disabled?: boolean;
}

const Search: FC<SearchProps> = ({ outlined, initialSearch, onQueryChange, disabled }) => {
  const [value, setValue] = useState(initialSearch || '');

  useEffect(() => {
    if (!onQueryChange) return;
    const query = value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .distinct();
    onQueryChange(query);
  }, [value]);

  const classes = useStyles();

  return (
    <Fragment>
      {outlined || (
        <div className={classes.wrapper}>
          <MahanIcon type={MahanIconType.Search} />
          <span className={classes.space} />
          <TextField disabled={disabled} label="Search" value={value} fullWidth onChange={e => setValue(e.target.value)} />
        </div>
      )}
      {outlined && (
        <TextField
          placeholder="Search"
          variant="outlined"
          margin="dense"
          disabled={disabled}
          fullWidth
          value={value}
          onChange={e => setValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MahanIcon type={MahanIconType.Search} />
              </InputAdornment>
            )
          }}
        />
      )}
    </Fragment>
  );
};

export default Search;

export function filterOnProperties<K extends string, T extends { [key in K]?: string | undefined | null }>(
  items: readonly T[],
  query: readonly string[],
  ...properties: (K | ((item: T) => string | null | undefined))[]
): readonly T[] {
  if (query.length === 0) return items;
  return items.filter(item => {
    for (let i = 0; i < properties.length; ++i) {
      for (let j = 0; j < query.length; ++j) {
        const property = properties[i];
        if ((((typeof property === 'function' ? property(item) : item[property]) || '') as string).toLowerCase().includes(query[j])) return true;
      }
    }
    return false;
  });
}
