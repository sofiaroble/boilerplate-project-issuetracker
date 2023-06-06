"use strict";
const mongoose = require("mongoose");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app.route("/api/issues/:project")
.get(async function (req, res) {
  let projectName = req.params.project;
  let matchObj = { name: projectName };
  
  const {
    _id,
    open,
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text
  } = req.query;

  //console.log('Received request:', req.query);

  // Build matchObj based on query parameters
  if (_id) matchObj['issues._id'] = new mongoose.Types.ObjectId(_id);
  if (open !== undefined) matchObj['issues.open'] = open === "true" ? true : false;
  if (issue_title) matchObj['issues.issue_title'] = issue_title;
  if (issue_text) matchObj['issues.issue_text'] = issue_text;
  if (created_by) matchObj['issues.created_by'] = created_by;
  if (assigned_to) matchObj['issues.assigned_to'] = assigned_to;
  if (status_text) matchObj['issues.status_text'] = status_text;

   //console.log('Matching object:', matchObj);

  try {
    const project = await ProjectModel.findOne({ name: projectName });
    
    //console.log('Found project:', project);

    if (!project) {
      res.json({ error: 'No project found' });
      return;
    }

    let filteredIssues = project.issues;

    // Filter issues based on matchObj
    if (_id) filteredIssues = filteredIssues.filter(issue => issue._id.toString() === _id);
    if (open !== undefined) filteredIssues = filteredIssues.filter(issue => issue.open.toString() === open);
    if (issue_title) filteredIssues = filteredIssues.filter(issue => issue.issue_title === issue_title);
    if (issue_text) filteredIssues = filteredIssues.filter(issue => issue.issue_text === issue_text);
    if (created_by) filteredIssues = filteredIssues.filter(issue => issue.created_by === created_by);
    if (assigned_to) filteredIssues = filteredIssues.filter(issue => issue.assigned_to === assigned_to);
    if (status_text) filteredIssues = filteredIssues.filter(issue => issue.status_text === status_text);

     //console.log('Filtered issues:', filteredIssues);

    res.json(filteredIssues);
  } catch (err) {
    console.log('Error occurred:', err);
    res.json({ error: 'Error occurred while retrieving issues' });
  }
})



    .post(async function (req, res) {
      try {
        let project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
        if (!issue_title || !issue_text || !created_by) {
          res.json({ error: "required field(s) missing" });
          return;
        }
        const newIssue = new IssueModel({
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
        });
        
        let projectdata = await ProjectModel.findOne({ name: project });
        if (!projectdata) {
          const newProject = new ProjectModel({ name: project });
          newProject.issues.push(newIssue);
          let data = await newProject.save();
          console.log(`POST - Saved new project: ${data}`);
          res.json(newIssue);
        } else {
          projectdata.issues.push(newIssue);
          let data = await projectdata.save();
          console.log(`POST - Updated existing project: ${data}`);
          res.json(newIssue);
        }
      } catch (err) {
        console.log(`POST - Error: ${err}`);
        res.send("There was an error saving in post");
      }
    })

   .put(async function (req, res) {
  let project = req.params.project;
  const {
    _id,
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
    open,
  } = req.body;
  if (!_id) {
    return res.json({ error: "missing _id" });
  }
  if (
    !issue_title &&
    !issue_text &&
    !created_by &&
    !assigned_to &&
    !status_text &&
    open === undefined
  ) {
    return res.json({ error: "no update field(s) sent", _id: _id });
  }

  try {
    const projectData = await ProjectModel.findOne({ name: project });
    if (!projectData) {
      return res.json({ error: "could not update", _id: _id });
    } 
    const issueData = projectData.issues.id(_id);
    if (!issueData) {
      return res.json({ error: "could not update", _id: _id });
    }
    issueData.issue_title = issue_title || issueData.issue_title;
    issueData.issue_text = issue_text || issueData.issue_text;
    issueData.created_by = created_by || issueData.created_by;
    issueData.assigned_to = assigned_to || issueData.assigned_to;
    issueData.status_text = status_text || issueData.status_text;
    issueData.updated_on = new Date();
    if(open !== undefined) {
      issueData.open = open;
    }

    const updatedProjectData = await projectData.save();

    if (!updatedProjectData) {
      return res.json({ error: "could not update", _id: _id });
    } 
    return res.json({ result: "successfully updated", _id: _id });
  } catch (err) {
    console.log(err);
    return res.json({ error: 'There was an error in the PUT operation' });
  }
})

   .delete(async function (req, res) {
    let projectName = req.params.project;
      const { _id } = req.body;

  //console.log(`Deleting issue ${_id} from project ${projectName}`);

    if (!_id) {
   // console.log('Missing _id');
      res.json({ error: 'missing _id' });
        return;
  }

   try {
    const project = await ProjectModel.findOne({ name: projectName });

    if (!project) {
      //console.log('Could not find project');
      res.send({ error: 'could not delete', '_id': _id });
      return;
    }

    const issue = project.issues.id(_id);

    if (!issue) {
      //console.log('Could not find issue in project');
      res.send({ error: 'could not delete', '_id': _id });
      return;
    }

    // Remove the issue from the issues array
     project.issues.pull({ _id: _id });

    // Mark the issues array as modified
     project.markModified('issues');

    // Save the project document
    try {
      await project.save();
      console.log('Successfully deleted issue');
      const result = { result: 'successfully deleted', '_id': _id };
      res.json(result);
      console.log('Result:', JSON.stringify(result));
    } catch (error) {
      console.error('Error saving project after issue deletion:', error);
      res.json({ error: 'could not delete', '_id': _id });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: 'Error occurred while deleting issue' });
  }
});
}