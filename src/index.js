import React, { Component } from 'react';
import isEqual from 'lodash/isEqual'
import './index.css';
import DropdownTreeSelect from "react-dropdown-tree-select";

const assignObjectPaths = (obj, stack) => {
  Object.keys(obj).forEach(k => {
    const node = obj[k];
    if (typeof node === "object") {
      node.path = stack ? `${stack}.${k}` : k;
      assignObjectPaths(node, node.path);
    }
  });
};
class TreeWidget extends Component {
  constructor(props){
    super(props)
    var data = props.tree
    if (props.annotation){
      this.searchTreeForChecked(props.annotation.bodies, data)
    }
    else{
      this.searchTreeForChecked({}, data)
    }
    this.state = { data: data ,
                    annotation: props.annotation}

  }
  onRemoveBody = body => {
    var newBody=[];
    for (var bodyEntry in this.props.annotation.bodies){
     if (this.props.annotation.bodies[bodyEntry].value === body.value){
      } else{
        newBody.push(this.props.annotation.bodies[bodyEntry]);
      }
    }
    this.props.onRemoveBody(body);
    var data = this.state.data
    this.searchTreeForChecked(newBody,data);
    this.setState(prevState => {
      return {
          data: data
      }
    })

  }
  searchTreeForChecked = function(tags, nodes){
    for (var node in nodes){
      var found=false;
      for (var tag in tags){
        if (!nodes[node].id){
          if (nodes[node].label==tags[tag]['value']){
            found=true
          }
        }
        else {
          if (nodes[node].label==tags[tag]['value']&nodes[node].id==tags[tag]['id']){
            found=true
          }
        }
      }
      if (found){
        nodes[node]["checked"]=true;
      }
      else{
          nodes[node]["checked"]=false;
      }
      if (nodes[node].children){
        this.searchTreeForChecked(tags,nodes[node].children);
        }
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if(!isEqual(nextProps.annotation, this.props.annotation)) {
      if (nextProps.annotation){
          var data =nextProps.tree

          this.searchTreeForChecked(nextProps.annotation.body, data)
          this.setState(prevState => {
            return {
                data: data
            }
        })
      }
    }
  }

  shouldComponentUpdate = (nextProps) => {
    return true;
  }

  // Every body with a 'tagging' purpose is considered a tag
  onDelete = tag => evt => {
    evt.stopPropagation();
    this.onRemoveBody(tag);
  }

  onSubmit = tag => {
    this.props.onAppendBody({ type: 'TextualBody', purpose: 'tagging', value: tag.trim() });
  }
  onAction = (node, action) => {
    console.log('onAction::', action, node)
  }
  onChange = (currentNode, selectedNodes) => {
    var id =false;
    if (currentNode.id){
      id=true
    }
    if (selectedNodes.includes(currentNode)) {
      var newBodyData={
        "type": "TextualBody",
        "value": currentNode["label"],
        "image": this.props.image
      }
      if (id){
        newBodyData["id"]=currentNode["id"]
      }
      this.props.onAppendBody(newBodyData);

    } else {
      if (this.props.annotation){
        if (this.props.annotation.underlying){
          if (this.props.annotation.underlying.body){
            for (var body of this.props.annotation.underlying.body){
              if (body.value === currentNode["label"]){
                this.onRemoveBody(body);
              }
            }
          }    
        }
      }
    }
  }
  searchPredicate = function(node, searchTerm) {
    var result = false;
    if (node.search){
      result = node.search && node.search.toLowerCase().indexOf(searchTerm) >= 0;
    }
    else {
      {
        result = node.label && node.label.toLowerCase().indexOf(searchTerm) >= 0;
      }
    }
    return result;
  }
  render(){
    let label = null
    if (this.props.annotation) {
      label = <tr><td>AnnotationID: {this.props.annotation.id}</td></tr>;
    } else {
      label = null
    }

  return (
            <div className="r6o-widget tree" >
              <table style="width:100%; white-space: break-spaces;">
                {(this.props.annotation && this.props.annotation.id) &&
                  <tr><td style="user-select: text;"><b>AnnotationID:</b> {this.props.annotation.id}</td></tr>
                }
                <tr>
                  <td>
                    <DropdownTreeSelect   data={this.state.data} searchPredicate={this.searchPredicate} keepTreeOnSearch={true} onAction={this.onAction} onChange={this.onChange} showPartiallySelected={false} hierarchical={true}/>
                  </td>
                </tr>
              </table>
            </div>

        );
  }
};




export default TreeWidget;