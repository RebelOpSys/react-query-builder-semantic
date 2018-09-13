import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

/**
 * Default element to represent a rule for a RuleGroup in the QueryBuilder
 */
class RuleSemantic extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        const { field, operator, value, translations, getOperators, schema: { fields, controls, classNames, ruleButtonSize, inputSize } } = this.props;
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
                    {React.createElement(controls.valueEditor,
                        {
                            field: field,
                            title: translations.value.title,
                            operator: operator,
                            size: inputSize,
                            value: value,
                            className: `${classNames.value}`,
                            handleOnChange: this.onValueChanged,
                        }
                    )
                    }
                    <Button
                        compact
                        circular
                        floated={'right'}
                        size={ruleButtonSize}
                        icon={translations.removeRule.icon}
                        onClick={this.removeRule}
                    />
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
        console.log(value);
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
    schema: PropTypes.object
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
