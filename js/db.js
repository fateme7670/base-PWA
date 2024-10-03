var db = new Dexie("test");
const dbVersion = 1;

db.version(dbVersion).stores({
  course: "_id",
  syncCourses: "title",
});
