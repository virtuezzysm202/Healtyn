import { Text, TextProps } from 'react-native'

export default function LansiaText(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 18, color: '#222' }, props.style]} />
}
