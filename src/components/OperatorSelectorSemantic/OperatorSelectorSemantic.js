import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

/**
 * Default Semantic element to select a operator for a Rule in the QueryBuilderSemantic
 */
const OperatorSelectorSemantic = (props) => {
    const { value, options, className, handleOnChange, title,ruleSemanticProps } = props;
    return (
        <Dropdown
            {...ruleSemanticProps.operatorSelector}
            title={title}
            className={className}
            options={options}
            defaultValue={value}
            onChange={(e, { value }) => handleOnChange(value)}
        />
    );
};

OperatorSelectorSemantic.displayName = 'OperatorSelectorSemantic';

OperatorSelectorSemantic.propTypes = {
    /**
     * Semantic Props for operatorSelector on a rule
     */
    ruleSemanticProps: PropTypes.shape({
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        operatorSelector: PropTypes.any,
    }),
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

export default OperatorSelectorSemantic;
