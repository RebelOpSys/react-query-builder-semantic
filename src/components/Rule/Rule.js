import React from 'react';
import PropTypes from 'prop-types';

/**
 * Default element to represent a rule for a RuleGroup in the QueryBuilder
 */
class Rule extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        const { field, operator, value, translations, getOperators, classNames , schema: { fields, controls } } = this.props;
        return (
            <div className={`${classNames.ruleContainer}`}>
                <div className={`${classNames.rule}`}>
                    {
                        React.createElement(controls.fieldSelector,
                            {
                                options: fields,
                                title: translations.fields.title,
                                value: field,
                                className: `${classNames.fields}`,
                                handleOnChange: this.onFieldChanged,
                            }
                        )
                    }
                    {
                        React.createElement(controls.operatorSelector,
                            {
                                field: field,
                                title: translations.operators.title,
                                options: getOperators(field),
                                value: operator,
                                className: `${classNames.operators}`,
                                handleOnChange: this.onOperatorChanged,
                            }
                        )
                    }
                    {
                        React.createElement(controls.valueEditor,
                            {
                                field: field,
                                title: translations.value.title,
                                operator: operator,
                                value: value,
                                className: `${classNames.value}`,
                                handleOnChange: this.onValueChanged,
                            }
                        )
                    }
                    <div className={`${classNames.ruleHeader}`}>
                        {
                            React.createElement(controls.removeRuleAction,
                                {
                                    label: translations.removeRule.label,
                                    title: translations.removeRule.title,
                                    className: `${classNames.removeRule}`,
                                    handleOnClick: this.removeRule,
                                })
                        }
                    </div>
                </div>
            </div>
        );
    }

    onFieldChanged = (value) => {
        this.onElementChanged('field', value);
    }

    onOperatorChanged = (value) => {
        this.onElementChanged('operator', value);
    }

    onValueChanged = (value) => {
        this.onElementChanged('value', value);
    }

    onElementChanged = (property, value) => {
        const { id, onPropChange } = this.props;

        onPropChange(property, value, id);
    }

    removeRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.onRuleRemove(this.props.id, this.props.parentId);
    }
}

Rule.propTypes = {
    /**
     * This is a callback function invoked to get the list of allowed operators for the given field
     */
    getOperators: PropTypes.func,
    /**
     * This is a callback function invoked to remove this rule from the RuleGroup
     */
    onRuleRemove: PropTypes.func,
    /**
     * This is a callback function invoked notify this rule has made a property change for operator,value,field
     */
    onPropChange: PropTypes.func,
    /**
     * This is a callback function invoked to return the current level for this rule
     */
    getLevel: PropTypes.func,
    /**
     * Random generated id for rule
     */
    id: PropTypes.any,
    /**
     *  Id for the RuleGroup this rule is nested in
     */
    parentId: PropTypes.any,
    /**
     *  Selected field for rule
     */
    field: PropTypes.any,
    /**
     * Selected operator for rule
     */
    operator: PropTypes.any,
    /**
     * Selected value for rule
     */
    value: PropTypes.any,
    /**
     * Current schema from QueryBuilder
     */
    schema: PropTypes.object,
    /**
     * This can be used to assign specific CSS classes to various controls that are created by the QueryBuilderSemantic
     */
    classNames: PropTypes.shape({
        /**
         *Root <div> element
         */
        queryBuilder: PropTypes.string,
        /**
         *<div> containing the RuleGroup
         */
        ruleGroup: PropTypes.string,
        /**
         *<Dropdown> control for combinators
         */
        combinators: PropTypes.string,
        /**
         *<Button> to add a Rule
         */
        addRule: PropTypes.string,
        /**
         *<Button> to add a RuleGroup
         */
        addGroup: PropTypes.string,
        /**
         *<Button> to remove a RuleGroup
         */
        removeGroup: PropTypes.string,
        /**
         *<div> containing the Rule
         */
        rule: PropTypes.string,
        /**
         *<Dropdown> control for fields
         */
        fields: PropTypes.string,
        /**
         *<Dropdown> control for operators
         */
        operators: PropTypes.string,
        /**
         *<Input> for the field value
         */
        value: PropTypes.string,
        /**
         *<Button> to remove a Rule
         */
        removeRule: PropTypes.string,
    }),
    /**
     * This can be used to override translatable texts created by the <QueryBuilderSemantic />
     * https://react.semantic-ui.com/elements/icon/
     */
    translations: PropTypes.shape({
        fields: PropTypes.shape({
            title: PropTypes.string
        }),
        operators: PropTypes.shape({
            title: PropTypes.string
        }),
        value: PropTypes.shape({
            title: PropTypes.string
        }),
        removeRule: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        removeGroup: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        addRule: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        addGroup: PropTypes.shape({
            icon: PropTypes.string,
            title: PropTypes.string
        }),
        combinators: PropTypes.shape({
            title: PropTypes.string
        })
    }),
};

Rule.defaultProps = {
    id: null,
    parentId: null,
    field: null,
    operator: null,
    value: null,
    schema: null
};

export default Rule;
