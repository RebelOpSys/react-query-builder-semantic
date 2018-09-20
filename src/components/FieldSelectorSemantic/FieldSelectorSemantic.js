import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/**
 * Default Semantic element to select a field for a Rule in the QueryBuilderSemantic
 */
const FieldSelectorSemantic = (props) => {
    const { value, options, className, handleOnChange, title, ruleSemanticProps } = props;
    return (
        <Dropdown
            {...ruleSemanticProps.fieldSelector}
            title={title}
            className={className}
            options={options}
            defaultValue={value}
            onChange={(e, { value }) => handleOnChange(value)}
        />
    );
};

FieldSelectorSemantic.displayName = 'FieldSelectorSemantic';

FieldSelectorSemantic.propTypes = {
    /**
     * Semantic Props for fieldSelector on a rule
     */
    ruleSemanticProps: PropTypes.shape({
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        fieldSelector: PropTypes.any,
    }),
    /**
     * selected field from the existing query representation, if any
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

export default FieldSelectorSemantic;
