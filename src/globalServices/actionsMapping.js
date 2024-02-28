import ActionFormContents from './mappedActionFormContents.json'
class ActionsMapping {

  constructor() {
  }

  getMappedActionDetails(actionIdentifier){
    return ActionFormContents[actionIdentifier] ?? null;
  }

} export default new ActionsMapping()
