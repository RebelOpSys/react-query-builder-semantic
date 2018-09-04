import React from 'react';
import PropTypes from 'prop-types';

/**
 * Default element to select a value for a Rule in the QueryBuilder
 */
const ValueSelector = (props) => {
  const {value, options, className, handleOnChange, title} = props;

  return (
    <select className={className}
            value={value}
            title={title}
            onChange={e=>handleOnChange(e.target.value)}>
      {
        options.map(option=> {
          return (
            <option key={option.id || option.name} value={option.name}>{option.label}</option>
          );
        })
      }
    </select>
  );
};

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
    /**
     * selected value for element
     */
  value: PropTypes.string,
    /**
     *
     */
  options: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        id: PropTypes.string
    })).isRequired,
    /**
     * //css className to be applied
     */
  className: PropTypes.string,
    /**
     * callback function to invoke when the element changes
     */
  handleOnChange: PropTypes.func,
    /**
     * html title
     */
  title: PropTypes.string,
};

export default ValueSelector;
