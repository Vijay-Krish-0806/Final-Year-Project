import {
  Create,
  NumberInput,
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
  SelectInput
} from "react-admin";

export const ChallengeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="question" label="Question" validate={[required()]} />
        <SelectInput
        source="type"
        choices={[
          {
            id:"SELECT",
            name:"SELECT"
          },
          {
            id:"ASSIT",
            name:"ASSIT"
          },
        ]}
        validate={[required()]}
        />
        <ReferenceInput source="lessonId" reference="lessons" />
        <NumberInput source="order" validate={[required()]} label="Order" />
      </SimpleForm>
    </Create>
  );
};
