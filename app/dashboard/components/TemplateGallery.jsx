import React from 'react';
import WorkflowTemplateCard from './WorkflowTemplateCard.jsx';
export default function TemplateGallery(props) { return <div className="grid">{(props.templates??[]).map(t=><WorkflowTemplateCard key={t.id} template={t} {...props}/>)}</div>; }
