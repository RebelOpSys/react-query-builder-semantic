import React from 'react';
import ValueEditor from 'react-query-builder-semantic/ValueEditor';

/** ValueEditor */
export default class ExampleValue extends React.Component {
    render() {
        return (
            <ValueEditor
                handleOnChange={() => {
                }}
                operator="="
                Value="Test"
                title="Value"
            />
        )
    }
}
