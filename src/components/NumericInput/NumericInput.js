/* eslint-disable no-param-reassign */
import { Input } from 'antd';
import React from 'react';

class NumericInput extends React.Component {
  state = {
    value: 0,
  };

  onChange = e => {
    const { onChange } = this.props;
    const { value } = e.target;
    const reg = /^[1-9][0-9]*$/;
    if (!Number.isNaN(value) && reg.test(value)) {
      this.setState({ value });
      onChange(value);
    }
  };

  render() {
    const { value } = this.state;
    return (
      <Input
        value={value}
        {...this.props}
        onChange={this.onChange}
        onBlur={this.onBlur}
        placeholder="Input a number"
        maxLength={25}
      />
    );
  }
}
export default NumericInput;
