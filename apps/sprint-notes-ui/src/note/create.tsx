import { NoteType } from './type';
import Form, { Field, FormApi, FormFooter } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Button from '@atlaskit/button/new';
import { emitNoteCreated } from './event';
import { emitErrorOccurred } from '../util/errorEvent';
import { useAtlassianJWT } from '../util/hooks';
import { useState } from 'react';
import { useSprintChangedListener } from '../sprint';

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
  const jwt = useAtlassianJWT();
  const handleSubmit = (
    formState: NoteFormState,
    form: FormApi<NoteFormState>
  ) => {
    if (!jwt) {
      return;
    }

    fetch(`/api/project/${props.projectId}/sprint/${sprintId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${jwt}`,
      },
      body: JSON.stringify({
        title: formState.title,
        content: formState.content,
      }),
    })
      .then((response) => response.json())
      .then((createdNote: NoteType) => {
        emitNoteCreated(createdNote);
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
