function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Pianificatore")
    .addItem("Lancia Pianificazione", "plan")
    .addToUi();
}
