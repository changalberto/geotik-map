import { useMemo } from 'react'
import PropTypes from 'prop-types'

import './Select.scss'

const Select = ({
  name,
  options,
  placeholder,
  onChange,
  selected,
  disabled,
  ...props
}) => {
  const Options = useMemo(
    () =>
      options.map(({ value, label }) => (
        <option key={value} value={`${value}`}>
          {label}
        </option>
      )),
    [options]
  )

  const _handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="select">
      <select
        name={name}
        onChange={_handleChange}
        {...(disabled ? { disabled } : {})}
        value={`${selected}`}
      >
        {placeholder && <option disabled>{placeholder}</option>}
        {Options}
      </select>
    </div>
  )
}

Select.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  selected: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
}

Select.defaultProps = {
  name: '[name]',
  options: [],
  onChange: () => {},
}

export default Select
