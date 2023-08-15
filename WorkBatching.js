function timeLeft() {
  var minutes = 28 // ~5 for external use, 28 internal
  return Date.now() - this.start < minutes * 60 * 1000 // 5 mins in milliseconds
}

function saveIndex(i) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(HOW_TO_TAB)
  processedAccs = sheet.getRange('A10').setValue(i)
}

function getIndex() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(HOW_TO_TAB)
  return sheet.getRange('A10').getValue()
}

function scheduleResume() {
  ScriptApp.newTrigger('resume')
    .timeBased()
    .after(10 * 1000)
    .create()
}

function resume(e) {
  isResumed = true
  deleteTrigger(e)
  updatePagesBusinessData()
}

function deleteTrigger(e) {
  if (typeof e != 'object') {
    return console.error('e is not an Object')
  } else if (!e.triggerUid) {
    return console.error("e doesn't have valid trigger UID")
  }
  console.log('event trigger id: ' + e.triggerUid)
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getUniqueId() == e.triggerUid) {
      console.log('Deleting trigger ' + trigger.getUniqueId())
      return ScriptApp.deleteTrigger(trigger)
    }
  })
}
