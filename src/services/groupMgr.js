import { getDepartments } from './apollo/apolloAdmin';

class GroupMgr {
  groups = [];

  init = async () => {
    const qr = await getDepartments();
    this.groups = qr.data.departments;
  };

  constructor() {
    this.init();
  }

  getGroups = async () => {
    if (this.groups.length === 0) await this.init();
    return this.groups.filter(ele => ele.parentId);
  };

  findNameById = id => this.groups.find(ele => ele.id === id);

  getChildren = async id => {
    if (this.groups.length === 0) await this.init();
    const nodeForSearch = this.groups.find(ele => ele.id === id);

    const children = [];
    const recursion = node => {
      this.groups.forEach(item => {
        if (item.parentId === node.id) {
          children.push(item);
          recursion(item);
        }
      });
    };
    recursion(nodeForSearch);
    return children;
  };

  getParents = async id => {
    if (this.groups.length === 0) await this.init();

    const nodeForSearch = this.groups.find(ele => ele.id === id);

    const parents = [];
    const recursion = node => {
      parents.push(node);
      if (node.parentId) recursion(this.groups.find(ele => ele.id === node.parentId));
    };
    recursion(nodeForSearch);
    return parents;
  };
}

const groupMgr = new GroupMgr();
export default groupMgr;
