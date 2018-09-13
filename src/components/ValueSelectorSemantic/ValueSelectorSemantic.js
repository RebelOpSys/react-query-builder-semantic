import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/**
 * Default Semantic element to select a value for a Rule in the QueryBuilder
 */
const ValueSelectorSemantic = (props) => {
    const { value, options, className, handleOnChange, title } = props;

    return (
        <Dropdown
            scrolling
            selection
            search
            title={title}
            className={className}
            options={options}
            defaultValue={value}
            onChange={(e, { value }) => handleOnChange(value)}
        />
    );
};

ValueSelectorSemantic.displayName = 'ValueSelectorSemantic';

ValueSelectorSemantic.propTypes = {
    /**
     * selected value for element
     */
    value: PropTypes.string,
    /**
     *
     */
    options: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        key: PropTypes.string
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

export default ValueSelectorSemantic;
