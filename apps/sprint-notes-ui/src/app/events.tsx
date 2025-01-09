import { useState } from 'react';
import { useErrorOccurredListener } from '../util/errorEvent';
import { AppearanceTypes, AutoDismissFlag, FlagGroup } from '@atlaskit/flag';
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { token } from '@atlaskit/tokens';
import { useNoteCreatedListener } from '../note';

type AppFlag = {
  id: number;
  title: string;
  message: string;
  icon: JSX.Element;
  appearance: AppearanceTypes;
};
export function Events() {
  const [flags, setFlags] = useState<Array<AppFlag>>([]);

  useErrorOccurredListener((error) => {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = error;
    }
    console.error(errorMessage);
    setFlags(
      flags.concat({
        id: flags.length,
        title: 'Error',
        message: errorMessage,
        appearance: 'error',
        icon: (
          <ErrorIcon
            label="Error"
            secondaryColor={token('color.background.danger.bold')}
          />
        ),
      })
    );
  });

  useNoteCreatedListener((note) => {
    setFlags(
      flags.concat({
        id: flags.length,
        title: 'Note Created',
        message: `Note ${note.title} created successfully`,
        appearance: 'success',
        icon: (
          <SuccessIcon
            label="Success"
            secondaryColor={token('color.background.success.bold')}
          />
        ),
      })
    );
  });

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };
  return (
    <FlagGroup onDismissed={handleDismiss}>
      {flags.map((flag) => {
        return (
          <AutoDismissFlag
            id={flag.id}
            appearance={flag.appearance}
            key={flag.id}
            title={flag.title}
            description={flag.message}
            icon={flag.icon}
          />
        );
      })}
    </FlagGroup>
  );
}
