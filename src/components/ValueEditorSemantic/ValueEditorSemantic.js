import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

/**
 * Default semantic element to input a value for a Rule in the QueryBuilder
 */
const ValueEditorSemantic = (props) => {
    const { operator, value, handleOnChange, title, className, size } = props;

    if (operator === 'null' || operator === 'notNull') {
        return null;
    }

    return (
        <Input type="text"
               error={!value}
               size={size}
               className={className}
               value={value}
               title={title}
               onChange={e => handleOnChange(e.target.value)} />
    );
};

ValueEditorSemantic.displayName = 'ValueEditorSemantic';

ValueEditorSemantic.propTypes = {
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
    /**
     * //css className to be applied
     */
    className: PropTypes.string,
};

export default ValueEditorSemantic;
