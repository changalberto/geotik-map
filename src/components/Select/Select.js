import { useMemo } from 'react'
import PropTypes from 'prop-types'

import './Select.scss'

const Select = ({
  name = '[name]',
  options = [],
  placeholder = 'Select an option',
  onChange = () => {},
  selected = null,
  disabled = false,
  ...props
}) => {
  const Options = useMemo(
    () =>
      options.map(({ value, label }) => (
        <option
          key={value}
          value={value}
          {...(selected === value ? { selected: true } : {})}
        >
          {label}
        </option>
      )),
    [options, selected]
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
      >
        {placeholder && (
          <option value={null} selected disabled>
            {placeholder}
          </option>
        )}
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
      selected: PropTypes.bool,
    })
  ),
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
}

export default Select
