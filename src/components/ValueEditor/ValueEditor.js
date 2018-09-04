import React from 'react';
import PropTypes from 'prop-types';

/**
 * Default element to input a value for a Rule in the QueryBuilder
 */
const ValueEditor = (props) => {
    const { operator, value, handleOnChange, title } = props;

    if (operator === 'null' || operator === 'notNull') {
        return null;
    }

    return (
        <input type="text"
               value={value}
               title={title}
               onChange={e => handleOnChange(e.target.value)} />
    );
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
    /**
     *
     */
    field: PropTypes.string,
    /**
     * operator name corresponding to Rule using the element
     */
    operator: PropTypes.string,
    /**
     * value from the existing query representation, if any
     */
    value: PropTypes.string,
    /**
     * callback function to invoke when the element changes
     */
    handleOnChange: PropTypes.func,
    /**
     * html title
     */
    title: PropTypes.string,
};

export default ValueEditor;
