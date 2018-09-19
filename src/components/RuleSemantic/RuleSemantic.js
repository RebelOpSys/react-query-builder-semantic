import React from 'react';
import PropTypes from 'prop-types';
import { Button, Segment } from 'semantic-ui-react';

/**
 * Default element to represent a rule for a RuleGroup in the QueryBuilderSemantic
 */
class RuleSemantic extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        const {
            field, operator, combinatorColor, ruleSemanticProps, value, translations, getOperators, classNames,
            schema: { fields, controls }
        } = this.props;
        return (
            <div className={`${classNames.ruleContainer}`}>
                <Segment {...ruleSemanticProps.segment} className={`${classNames.rule}`}
                         color={combinatorColor}>
                    {
                        React.createElement(controls.fieldSelector,
                            {
                                options: fields,
                                title: translations.fields.title,
                                value: field,
                                ruleSemanticProps,
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
                                ruleSemanticProps,
                                value: operator,
                                className: `${classNames.operators}`,
                                handleOnChange: this.onOperatorChanged,
                            }
                        )
                    }
                    {React.createElement(controls.valueEditor,
                        {
                            field: field,
                            title: translations.value.title,
                            operator: operator,
                            ruleSemanticProps,
                            value: value,
                            className: `${classNames.value}`,
                            handleOnChange: this.onValueChanged,
                        }
                    )
                    }
                    <Button
                        {...ruleSemanticProps.deleteRuleButton}
                        onClick={this.removeRule}
                    />
                </Segment>
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

RuleSemantic.propTypes = {
    /**
     * Semantic Props for valueEditor,fieldSelector,valueSelector,segment,deleteRuleButton on a rule
     */
    ruleSemanticProps: PropTypes.shape({
        /**
         * Semantic Input props on a rule
         * https://react.semantic-ui.com/elements/input/
         */
        valueEditor: PropTypes.any,
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        fieldSelector: PropTypes.any,
        /**
         * Semantic Dropdown props on a rule
         * https://react.semantic-ui.com/modules/dropdown/
         */
        operatorSelector: PropTypes.any,
        /**
         * Semantic Segment props on a rule
         * https://react.semantic-ui.com/elements/segment/
         */
        segment: PropTypes.any,
        /**
         * Semantic delete Button props on a rule
         * https://react.semantic-ui.com/elements/button/
         */
        deleteRuleButton: PropTypes.any,
    }),
    /**
     * color for rule segment selected based on combinatorColors array for selected combinator
     */
    combinatorColor: PropTypes.string,
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

RuleSemantic.defaultProps = {
    id: null,
    parentId: null,
    field: null,
    operator: null,
    value: null,
    schema: null
};

export default RuleSemantic;
