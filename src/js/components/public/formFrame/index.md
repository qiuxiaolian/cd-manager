# FormFrame

## Usage

新表单

```js
import FormFrame from "component/public/formFrame";
const {
  FormLump,
  FormBtn,
  FormHeadTabs,
  FormHeadTab,
  FormContentTabs,
  FormContentTab
} = FormFrame;

// FormBtn 可传自定的按钮
// keySize ["small", "middle", "lg"] 中的一个, 决定 item key 的宽度
 1. 单页面表单
<form onSubmit={func}>
  <FormFrame className="string" keySize="small">
    <FormLump title="string">{children}</FormLump>
    <FormLump title="string">{children}</FormLump>
    <FormBtn submitText="更新" formName="reduxForm Name" />
  </FormFrame>
</form>;

2. 多页面表单, 每个 tab 页需要单独的表单

// Copyright 2017 caicloud authors. All rights reserved.

每个表单需要一个单独的文件
import { reduxForm } from "caicloud-redux-form";
import FormField from "component/public/formField_v2";
import FormFrame from "component/public/formFrame";
import { required } from "./validate";
const { FormLump, FormBtn } = FormFrame;

class From1 extends React.Component {
  submit = () => {};
  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(this.submit)}>
        <FormLump>
          <FormField
            name="名称"
            fieldName="cid"
            component="Input"
            validate={required}
          />
        </FormLump>
        <FormBtn formName="form1" formName="form1" />
      </form>
    );
  }
}

export default reduxForm({
  form: "form1",
  getFormState: state => state.form_v6
})(From1);


  <FormFrame className="string" keySize="small" currentIndex={0} onClick={() => {}}>
    <FormHeadTabs>
      <FormHeadTab>1</FormHeadTab>
      <FormHeadTab>2</FormHeadTab>
    </FormHeadTabs>
    <FormContentTabs>
      <FormContentTab>
        <FormLump>
          <From1 />
        </FormLump>
      </FormContentTab>
      <FormContentTab>
        <Form1 />
      </FormContentTab>
    </FormContentTabs>
  </FormFrame>

3. 可删除的 Tab 表单

<FormFrame className="string" keySize="small" currentIndex={0} onClick={() => {}}>
  <FormHeadTabs
    editable
    handleTabClose={index => { removeTab(index) }}
    handleTabAdd={addTab}
  >
    <FormHeadTab>1</FormHeadTab>
    <FormHeadTab>2</FormHeadTab>
  </FormHeadTabs>
  <FormContentTabs>
    <FormContentTab>
      <FormLump>
        <From1 />
      </FormLump>
    </FormContentTab>
    <FormContentTab>
      <Form1 />
    </FormContentTab>
  </FormContentTabs>
</FormFrame>
```
