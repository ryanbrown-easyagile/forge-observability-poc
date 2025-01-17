import { NoteType } from './type';
import Form, { Field, FormApi, FormFooter } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Button from '@atlaskit/button/new';
import { emitNoteCreated } from './event';
import { emitErrorOccurred } from '../util/errorEvent';
import { useState } from 'react';
import { useSprintChangedListener } from '../sprint';
import { invoke } from '@forge/bridge';

type NoteFormProps = {
  sprintId: number;
  projectId: string;
};

type NoteFormState = {
  title: string;
  content: string;
};

export function NoteForm(props: NoteFormProps) {
  const [sprintId, setSprintId] = useState(props.sprintId);
  useSprintChangedListener((sprintId) => {
    setSprintId(sprintId);
  });
  const handleSubmit = (
    formState: NoteFormState,
    form: FormApi<NoteFormState>
  ) => {
    invoke('saveNotes', {projectId: props.projectId, sprintId: sprintId, note: {
      title: formState.title,
      content: formState.content
    } })
      .then((createdNote) => {
        emitNoteCreated(createdNote as NoteType);
        form.restart({
          title: '',
          content: '',
        });
      })
      .catch((error) => {
        emitErrorOccurred(error);
      });
  };

  return (
    <Form<NoteFormState> onSubmit={handleSubmit}>
      {({ formProps }) => (
        <form {...formProps}>
          <Field name="title" label="Title" isRequired>
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <Field name="content" label="Content" isRequired defaultValue="">
            {({ fieldProps }: any) => <TextArea {...fieldProps} />}
          </Field>
          <FormFooter>
            <Button type="submit" appearance="primary">
              Submit
            </Button>
          </FormFooter>
        </form>
      )}
    </Form>
  );
}
