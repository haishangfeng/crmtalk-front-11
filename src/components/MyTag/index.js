import { Tag, message } from 'antd';
import React from 'react';

// eslint-disable-next-line prefer-destructuring
const CheckableTag = Tag.CheckableTag;

// allTags
// const allTags = ['吃💩💩', '🦙🦙🦙', '溜了溜了', '啊哈哈哈'];
const allTags = [
  {
    id: '111',
    name: '111111',
    price: 500,
  },
  {
    id: '222',
    name: '222222',
    price: 500,
  },
  {
    id: '333',
    name: '333333',
    price: 500,
  },
  {
    id: '444',
    name: '444444',
    price: 500,
  },
];
// eslint-disable-next-line react/prefer-stateless-function
class MyTag extends React.Component {
  render() {
    return (
      <div>
        {allTags.map(tag => (
          <CheckableTag
            key={tag.id}
            onChange={() => {
              console.log(tag);
            }}
          >
            {tag.name}
          </CheckableTag>
        ))}
      </div>
    );
  }
}
export default MyTag;
