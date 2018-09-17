import React from 'react';
import Rule from '../RuleSemantic';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';

/**
 * Default element to group rules for the QueryBuilder
 */
class RuleGroupSemantic extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            combinator, rules, translations, onRuleRemove, createRule, onRuleAdd, createRuleGroup, onGroupAdd, onGroupRemove,
            isRuleGroup, getLevel, getOperators, onPropChange, schema: { combinators, classNames, groupButtonSize }
        } = this.props;
        return (
            <div className={`${classNames.ruleGroupContainer}`}>
                <div className={`${classNames.ruleGroup}`}>
                    <Button.Group className={'group--header'} compact labeled icon size={groupButtonSize}>
                        <Dropdown
                            button
                            className={'icon'}
                            floating
                            labeled
                            scrolling
                            onChange={this.onCombinatorChange}
                            icon={translations.combinators.icon}
                            options={combinators}
                            defaultValue={combinator}
                        />
                        <Button
                            className={classNames.addRule}
                            icon={translations.addRule.icon}
                            content={translations.addRule.title}
                            onClick={this.addRule}
                        />
                        <Button
                            className={classNames.addGroup}
                            icon={translations.addGroup.icon}
                            content={translations.addGroup.title}
                            onClick={this.addGroup}
                        />
                        {
                            this.hasParentGroup() ?
                                <Button
                                    className={classNames.removeGroup}
                                    icon={translations.removeGroup.icon}
                                    content={translations.removeGroup.title}
                                    onClick={this.removeGroup}
                                /> : null
                        }
                    </Button.Group>
                    <div className="group--children">
                        {
                            rules.map(rule => {
                                return (
                                    isRuleGroup(rule)
                                        ? <RuleGroupSemantic key={rule.id}
                                                             id={rule.id}
                                                             schema={this.props.schema}
                                                             parentId={this.props.id}
                                                             onGroupAdd={onGroupAdd}
                                                             getLevel={getLevel}
                                                             isRuleGroup={isRuleGroup}
                                                             createRuleGroup={createRuleGroup}
                                                             onGroupRemove={onGroupRemove}
                                                             onPropChange={onPropChange}
                                                             onRuleAdd={onRuleAdd}
                                                             onRuleRemove={onRuleRemove}
                                                             createRule={createRule}
                                                             getOperators={getOperators}
                                                             combinator={rule.combinator}
                                                             translations={this.props.translations}
                                                             rules={rule.rules} />
                                        : <Rule key={rule.id}
                                                id={rule.id}
                                                field={rule.field}
                                                value={rule.value}
                                                getOperators={getOperators}
                                                onPropChange={onPropChange}
                                                getLevel={getLevel}
                                                operator={rule.operator}
                                                schema={this.props.schema}
                                                parentId={this.props.id}
                                                translations={this.props.translations}
                                                onRuleRemove={onRuleRemove} />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }

    hasParentGroup() {
        return this.props.parentId;
    }

    onCombinatorChange = (e, { value }) => {
        const { onPropChange } = this.props;
        onPropChange('combinator', value, this.props.id);
    };

    addRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { createRule, onRuleAdd } = this.props;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    };

    addGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const { createRuleGroup, onGroupAdd } = this.props;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id)
    };

    removeGroup = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.onGroupRemove(this.props.id, this.props.parentId);
    };


}

RuleGroupSemantic.propTypes = {
    /**
     * This is a callback function invoked to get the list of allowed operators for the given field
     */
    getOperators: PropTypes.func,
    /**
     * This is a callback function invoked to return the current level for this rule
     */
    getLevel: PropTypes.func,
    /**
     * This is a callback function invoked when a rule is removed
     */
    onRuleRemove: PropTypes.func,
    /**
     * This is a callback function invoked notify this ruleGroup has made a property change for combinator
     */
    onPropChange: PropTypes.func,
    /**
     * This is a callback function invoked when this RuleGroup is removed
     */
    onGroupRemove: PropTypes.func,
    /**
     * This is a callback function to return a new default RuleGroup
     */
    createRuleGroup: PropTypes.func,
    /**
     * This is a callback function invoked when clicking on creating a new RuleGroup
     */
    onGroupAdd: PropTypes.func,
    /**
     * This is a callback function to return a new default Rule
     */
    createRule: PropTypes.func,
    /**
     * This is a callback function invoked when clicking on creating a new Rule
     */
    onRuleAdd: PropTypes.func,
    /**
     * This is a callback function invoked to determine if the element is a RuleGroup
     */
    isRuleGroup: PropTypes.func,
    /**
     * Random generated id for rule
     */
    id: PropTypes.any.isRequired,
    /**
     *  Id for the RuleGroup this RuleGroup is nested in
     */
    parentId: PropTypes.any,
    /**
     * Array of current Rules
     */
    rules: PropTypes.array,
    /**
     * Selected combinator value
     */
    combinator: PropTypes.string.isRequired,
    /**
     * Current schema from QueryBuilder
     */
    schema: PropTypes.object,
};

RuleGroupSemantic.defaultProps = {
    id: null,
    parentId: null,
    rules: [],
    combinator: 'and',
    schema: {},
};


export default RuleGroupSemantic;
