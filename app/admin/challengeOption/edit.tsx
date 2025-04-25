import {
  Edit,
  
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
  BooleanField
} from "react-admin";

export const ChallengeOptionEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="text" label="Text" validate={[required()]} />
        <BooleanField
        source="correct"
        label="Correct Option"
        />
        <ReferenceInput source="challengeId" reference="challenges" />
        <TextInput source="imageSrc" label="Image Url" />
        <TextInput source="audioSrc" label="Audio Url" />
      </SimpleForm>
    </Edit>
  );
};
