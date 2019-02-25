import {
  getDictionaryItems,
  deleteDictionaryItem,
  addDictionaryItem,
  updateDictionaryItem,
} from './apollo/apolloCommon';

class DictionariesMgr {
  dictionaries = [];

  init = async () => {
    const qr = await getDictionaryItems();

    if (qr.error || qr.errors) {
      this.dictionaries = [];
      return [];
    }
    this.dictionaries = qr.data.dictionaries;
    this.dictionaries.sort((a, b) => b.sortIndex - a.sortIndex);
    return this.dictionaries;
  };

  getChildren = (id, itemName) => {
    if (itemName) {
      let children = this.dictionaries.filter(ele => ele.itemParentId === id);
      children = children.map(ele => ({
        ...ele,
        itemParentName: itemName,
      }));
      return children;
    }
    const children = this.dictionaries.filter(ele => ele.itemParentId === id);
    return children;
  };

  getChildrenByRoot = async rootIndex => {
    if (this.dictionaries.length === 0) await this.init();

    const dictionaryItem = this.dictionaries.find(ele => ele.rootIndex === rootIndex);
    let children = this.dictionaries.filter(
      ele => ele.itemParentId === dictionaryItem.id && ele.itemAvailiable === true
    );
    children = children.sort((a, b) => a.sortIndex - b.sortIndex);
    return children;
  };

  getPersonalProps = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const personalPropsRoot = this.dictionaries.find(
      ele => ele.rootIndex === -1 && ele.itemParentId === null
    );
    const res = await this.getChildren(personalPropsRoot.id, '个人属性');
    return res;
  };

  getTracings = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const tracingRoot = this.dictionaries.find(
      ele => ele.rootIndex === -2 && ele.itemParentId === null
    );
    const res = await this.getChildren(tracingRoot.id, '回访字典');
    return res;
  };

  getAgencies = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const agencyRoot = this.dictionaries.find(
      ele => ele.rootIndex === -3 && ele.itemParentId === null
    );
    const res = await this.getChildren(agencyRoot.id, '市场合作机构');
    return res;
  };

  getBills = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const billsRoot = this.dictionaries.find(
      ele => ele.rootIndex === -4 && ele.itemParentId === null
    );
    const res = await this.getChildren(billsRoot.id, '收费字典');
    return res;
  };

  getAds = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const adsRoot = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -5
    );
    const res = await this.getChildren(adsRoot.id, '广告类别和计划');
    return res;
  };

  getTreatments = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const treatments = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -6
    );
    const res = await this.getChildren(treatments.id, '手术状态和疗程状态');
    return res;
  };

  getMainProjects = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const mainProjects = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -7
    );
    const res = await this.getChildren(mainProjects.id, '项目字典');
    return res;
  };

  getTags = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const tags = this.dictionaries.find(ele => ele.itemParentId === null && ele.rootIndex === -8);
    const res = await this.getChildren(tags.id, '客户标签');
    return res;
  };

  getConsultations = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const consultations = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -9
    );
    const res = await this.getChildren(consultations.id, '咨询方式');
    return res;
  };

  getConsultationsResult = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const consultationsRes = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -10
    );
    const res = await this.getChildren(consultationsRes.id, '咨询结果');
    return res;
  };

  getVips = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const vips = this.dictionaries.find(ele => ele.itemParentId === null && ele.rootIndex === -11);
    const res = await this.getChildren(vips.id, '客户VIP等级');
    return res;
  };

  getTohospitalCates = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const toHospitalCates = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -12
    );
    const res = await this.getChildren(toHospitalCates.id, '来院类型');
    return res;
  };

  getWheres = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const wheres = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -13
    );
    const res = await this.getChildren(wheres.id, '区域');
    return res;
  };

  getMainFrom = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const mainFroms = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -14
    );
    const res = await this.getChildren(mainFroms.id, '主来源');
    return res;
  };

  getProductions = async () => {
    if (this.dictionaries.length === 0) await this.init();
    const productions = this.dictionaries.find(
      ele => ele.itemParentId === null && ele.rootIndex === -15
    );
    const res = await this.getChildren(productions.id, '收费项目');
    return res;
  };

  addDictionary = async node => {
    const resp = await addDictionaryItem(node);
    if (resp.errors || resp.error) return 'error';
    return resp.data.addDictionaryItem;
  };

  updateDictionaryItem = async node => {
    const resp = await updateDictionaryItem(node);
    if (resp.errors || resp.error) return 'error';
    return resp.data.updateDictionaryItem;
  };

  deleteDictionary = async nodes => {
    const promises = [];

    nodes.forEach(node => {
      promises.push(deleteDictionaryItem(node));
    });
    const respones = await Promise.all(promises);
    let lostFlag = false;
    respones.forEach(resp => {
      if (resp.error || resp.errors) lostFlag = true;
    });
    if (lostFlag) return 'error';

    const ret = [];
    respones.forEach(ele => {
      ret.push(ele.data.deleteDictionaryItem);
    });
    return ret;
  };

  constructor() {
    this.init();
  }
}
const dictionariesMgr = new DictionariesMgr();
export default dictionariesMgr;

// 针对一级类目的枚举
export const DictionaryItem = {
  Marriage: 100,
  Phone: 101,
  Education: 102,
  Job: 103,
  Car: 104,
  Vips: 105,

  /** 回访结果 */
  TraceResult: 200,
  /** 客户流向 */
  TraceUserTo: 201,
  /** 回访状态 */
  TraceStatus: 201,
  /** 回访主题 */
  TraceProject: 203,
  /** 回访类型 */
  TraceType: 204,
  /** 回访方式 */
  TraceWay: 205,

  AgencyType: 300,
  AgencyLevel: 301,
  AgencyCoStatus: 302,
};
